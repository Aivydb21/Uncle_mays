{#
  internal_test_filter
  --------------------
  Returns a SQL boolean expression that evaluates true when the row belongs
  to an internal / founder / smoke-test Stripe customer and should be
  excluded from analytics + financial marts.

  Sources of truth:
    var('internal_test_customer_ids') — explicit Stripe customer IDs
    var('internal_test_email_domains') — domains that imply internal

  Usage in a staging model:
    where not ({{ is_internal_test('customer_id', 'email') }})

  Pass NULL (as a literal) for either column if the table does not have it.
  stg_stripe_charges, for example, only has customer_id:
    where not ({{ is_internal_test('customer_id', "null") }})
#}
{% macro is_internal_test(customer_id_col, email_col) %}
    coalesce(
        (
            {% set ids = var('internal_test_customer_ids', []) %}
            {% if ids %}
                {{ customer_id_col }} in (
                    {% for cid in ids %}'{{ cid }}'{% if not loop.last %}, {% endif %}{% endfor %}
                )
            {% else %}
                false
            {% endif %}
        ),
        false
    )
    {% set domains = var('internal_test_email_domains', []) %}
    {% if domains %}
        or coalesce(
            (
                {{ email_col }} is not null
                and (
                    {% for d in domains %}
                        lower({{ email_col }}) like '%{{ d }}'{% if not loop.last %} or {% endif %}
                    {% endfor %}
                )
            ),
            false
        )
    {% endif %}
{% endmacro %}
