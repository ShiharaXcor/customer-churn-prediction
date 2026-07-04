def generate_retention_suggestions(top_risk_factors: list) -> list:
    """
    Generates actionable retention suggestions based on a customer's
    top SHAP risk factors (feature name + direction of impact).
    Matches on base feature name (before any one-hot suffix) so it
    works regardless of which category the encoder dropped.
    """
    suggestions = []

    increasing_factors = [f["Feature"] for f in top_risk_factors if f["Direction"] == "increases risk"]

    rules = {
        "Contract": "Offer a discounted 1-year or 2-year contract to lock in loyalty and reduce churn risk.",
        "MonthlyCharges": "Provide a loyalty discount or bundle offer to reduce perceived cost burden.",
        "AvgMonthlySpend": "Provide a loyalty discount or bundle offer to reduce perceived cost burden.",
        "tenure": "Engage with a personalized onboarding check-in — early-tenure customers churn most.",
        "InternetService": "Investigate service quality/pricing complaints — internet service type is a key churn driver for this customer.",
        "PaymentMethod": "Encourage switch to autopay/credit card — linked to higher churn historically.",
        "TechSupport": "Offer a free trial of Tech Support add-on to increase engagement and reduce frustration.",
        "OnlineSecurity": "Bundle Online Security service at a discount — improves perceived value.",
        "OnlineBackup": "Bundle Online Backup service — increases switching cost and perceived value.",
        "DeviceProtection": "Offer Device Protection add-on — increases engagement and reduces churn risk.",
        "StreamingTV": "Highlight underused streaming entertainment value in a re-engagement offer.",
        "StreamingMovies": "Highlight underused streaming entertainment value in a re-engagement offer.",
        "PaperlessBilling": "Confirm billing clarity — review recent billing communications for confusion.",
        "TotalServices": "Recommend a service bundle upgrade to increase switching cost and engagement.",
        "ChargeIncreaseFlag": "Flag for account review — recent charge increase may be driving dissatisfaction.",
        "SeniorCitizen": "Offer simplified plans or dedicated support — senior customers may value more guidance.",
        "Dependents": "Consider family/multi-line bundle discounts to increase account stickiness.",
        "Partner": "Consider household bundle offers to increase account stickiness.",
        "MultipleLines": "Offer a multi-line discount to increase account value and stickiness.",
    }

    for factor in increasing_factors:
        base_name = factor.split("_")[0]
        for key, suggestion in rules.items():
            if key.lower() == base_name.lower() or key.lower() in factor.lower():
                if suggestion not in suggestions:
                    suggestions.append(suggestion)
                break

    if not suggestions:
        suggestions.append("Monitor account — no single dominant risk factor identified; consider a general satisfaction survey.")

    return suggestions[:4]