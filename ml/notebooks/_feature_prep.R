# Reusable feature-prep for the conversion-prediction dataset.
#
# Sourced by 01_first_look_baseline.qmd. Kept in a separate file so future
# training scripts in ml/models/ can source the same logic.

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(tibble)
  library(stringr)
  library(lubridate)
  library(arrow)
})

# Columns populated only AFTER the payment outcome is known. Including any of
# these in the feature matrix would leak the label.
LEAKAGE_COLS <- c(
  "chg_status", "chg_failure_code", "chg_failure_message",
  "chg_network_status", "chg_seller_message", "chg_outcome_type",
  "chg_risk_level",
  "cs_recovery1_at", "cs_recovery2_at", "cs_recovery3_at"
)

# Identifiers + raw text we never want as features.
ID_COLS <- c(
  "attempt_id", "payment_intent_id",
  "email", "email_hash", "customer_id", "customer_name",
  "metadata_email", "billing_email", "billing_name",
  "client_ip", "client_user_agent",
  "cart_json", "mc_tags", "apollo_org_name", "apollo_city",
  "apollo_state", "apollo_country", "apollo_labels",
  "shipping_street", "metadata_utm_content", "metadata_utm_term",
  "fbc", "fbp", "gclid", "fbclid",
  "checkout_session_local_id", "line_items_summary"
)

#' Find the latest conversion_v2 parquet on disk.
latest_parquet <- function(dir = "../data/processed",
                           pattern = "^conversion_v2_.*\\.parquet$") {
  files <- list.files(dir, pattern = pattern, full.names = TRUE)
  if (length(files) == 0) {
    stop("No conversion_v2 parquet found in ", dir,
         ". Run: python -m ml.features.build_dataset")
  }
  sort(files, decreasing = TRUE)[1]
}

#' Cap anonymous (null-email) attempts so a single 280-attempt bot doesn't
#' dominate. Group by whatever pseudo-identifier columns exist
#' (client_ip / customer_name / shipping_zip), fall back to a global first-N
#' when no fingerprint columns are populated.
cap_anonymous <- function(df, max_per_bucket = 3) {
  df <- df %>% arrange(created_at)
  if (!"email_hash" %in% names(df)) return(df)

  with_id <- df %>% dplyr::filter(!is.na(email_hash))
  anon    <- df %>% dplyr::filter(is.na(email_hash))
  if (nrow(anon) == 0) return(with_id)

  fp_cols <- intersect(c("client_ip", "customer_name", "shipping_zip"),
                       names(anon))

  if (length(fp_cols) == 0) {
    # No pseudo-identifier columns at all — global cap.
    return(bind_rows(with_id, anon %>% slice_head(n = max_per_bucket)))
  }

  bucket_expr <- paste0(
    "paste(",
    paste0("dplyr::coalesce(as.character(", fp_cols, "), 'NA')",
           collapse = ", "),
    ", sep = '|')"
  )
  anon <- anon %>% mutate(.bucket = !!rlang::parse_expr(bucket_expr))

  has_fp <- anon %>%
    dplyr::filter(.bucket != paste(rep("NA", length(fp_cols)), collapse = "|")) %>%
    group_by(.bucket) %>%
    slice_head(n = max_per_bucket) %>%
    ungroup()

  no_fp <- anon %>%
    dplyr::filter(.bucket == paste(rep("NA", length(fp_cols)), collapse = "|")) %>%
    slice_head(n = max_per_bucket)

  bind_rows(with_id, has_fp, no_fp) %>%
    select(-.bucket) %>%
    arrange(created_at)
}

#' Drop leakage + ID columns; cast types; cap the anonymous outlier.
#'
#' Order matters: cap anonymous attempts FIRST (while client_ip / customer_name
#' columns still exist), then drop leakage + ID columns.
clean_attempts <- function(df_raw, max_per_anon_bucket = 3, verbose = TRUE) {
  n_in <- nrow(df_raw)

  # 1. Cap anonymous attempts (uses email_hash / client_ip / customer_name).
  df_capped <- cap_anonymous(df_raw, max_per_bucket = max_per_anon_bucket)

  if (verbose) {
    cat("[clean] capped anonymous attempts: ", n_in, " -> ",
        nrow(df_capped), " rows\n", sep = "")
  }

  # 2. Drop leakage + ID columns.
  drop_cols <- intersect(c(LEAKAGE_COLS, ID_COLS), names(df_capped))
  df <- df_capped %>% select(-any_of(drop_cols))

  if (verbose) {
    cat("[clean] dropped ", length(drop_cols),
        " leakage/ID columns\n", sep = "")
  }

  # 3. Coerce types for downstream recipes.
  df <- df %>% mutate(label = factor(label, levels = c("0", "1")))
  if ("created_at" %in% names(df)) {
    df <- df %>% mutate(created_at = as.POSIXct(created_at, tz = "UTC"))
  }

  # Cast logical columns to integer so glmnet's matrix conversion works.
  log_cols <- setdiff(names(df)[vapply(df, is.logical, logical(1))], "label")
  if (length(log_cols) > 0) {
    df <- df %>% mutate(across(all_of(log_cols), as.integer))
  }

  df
}

#' Build a tidymodels recipe ready for any tree/linear model.
#'
#' @param df cleaned dataframe (output of clean_attempts())
#' @param use_smote if TRUE, append step_smote(label) for the imbalance experiment
build_recipe <- function(df, use_smote = FALSE) {
  library(recipes)
  library(themis)

  # Pre-cast logicals to integer so glmnet (which requires a numeric matrix)
  # doesn't choke on them. Doing this OUTSIDE the recipe because step_mutate
  # with all_logical_predictors() is fiddly across recipes versions.
  log_cols <- names(df)[vapply(df, is.logical, logical(1))]
  if (length(log_cols) > 0) {
    df <- df %>% mutate(across(all_of(log_cols), as.integer))
  }

  rec <- recipes::recipe(label ~ ., data = df) %>%
    # Time features from created_at
    step_mutate(
      .dow         = lubridate::wday(created_at, week_start = 1),
      .hour        = lubridate::hour(created_at),
      .is_weekend  = as.integer(lubridate::wday(created_at, week_start = 1) >= 6),
      .log_amount  = log10(pmax(amount_cents, 1) + 1),
      .log_seconds_since_prior =
        log10(pmax(seconds_since_prior_attempt, 1) + 1)
    ) %>%
    # Remove timestamp/raw-datetime columns. any_of() so missing cols don't error.
    step_rm(any_of(c("created_at", "last_paid_at", "cust_created_at",
                     "cs_recovery0_at", "cs_recovery3_at"))) %>%
    # Lump rare categorical levels.
    step_other(all_nominal_predictors(), threshold = 0.02, other = "Other") %>%
    # Drop zero-variance + (near-zero-variance) columns.
    step_zv(all_predictors()) %>%
    step_nzv(all_predictors(), freq_cut = 95 / 5, unique_cut = 10) %>%
    # Categorical to numeric for engines that need it.
    step_unknown(all_nominal_predictors(), new_level = "missing") %>%
    step_dummy(all_nominal_predictors(), one_hot = FALSE) %>%
    # Median-impute numerics for the linear model (trees ignore it).
    step_impute_median(all_numeric_predictors())

  if (use_smote) {
    rec <- rec %>% themis::step_smote(label, over_ratio = 1)
  }

  rec
}
