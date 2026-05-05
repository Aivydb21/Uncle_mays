# One-time package install for the ML notebooks.
# Run with:  Rscript ml/notebooks/_setup.R
#
# Idempotent — only installs packages that aren't already present.

repos <- c(CRAN = "https://cloud.r-project.org")

required <- c(
  # Core data
  "arrow",         # parquet reader (matches the Python ingest output)
  "tibble",
  "dplyr",
  "tidyr",
  "stringr",
  "lubridate",
  "purrr",
  # Modeling stack (tidymodels meta-package + engines)
  "tidymodels",    # bundles recipes, parsnip, workflows, tune, yardstick, rsample, dials, broom
  "workflowsets",  # workflow_set / workflow_map
  "glmnet",        # logistic regression engine
  "ranger",        # random forest engine
  "xgboost",       # boosted trees engine
  "themis",        # SMOTE step for recipes
  # Diagnostics + reporting
  "vip",           # variable importance plots
  "naniar",        # missingness summaries
  "gt",            # tidy tables
  "ggplot2",
  "scales",
  "knitr"
)

installed <- rownames(installed.packages())
missing <- setdiff(required, installed)

if (length(missing) > 0) {
  cat("Installing", length(missing), "packages:", paste(missing, collapse = ", "), "\n")
  install.packages(missing, repos = repos, dependencies = TRUE)
} else {
  cat("All", length(required), "required packages already installed.\n")
}

# Sanity check: load each one quietly.
for (p in required) {
  ok <- suppressWarnings(suppressMessages(requireNamespace(p, quietly = TRUE)))
  cat(if (ok) "[OK] " else "[FAIL] ", p, "\n", sep = "")
}
