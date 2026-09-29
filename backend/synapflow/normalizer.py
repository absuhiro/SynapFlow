class SynapFlowNormalizer:
    """
    Converts SynapFlow's canonical application data
    into the schema required by each department.
    """

    @staticmethod
    def transform(data: dict, department: str) -> dict:

        # ---------------------------------------------
        # Revenue Department
        # ---------------------------------------------

        if department == "Revenue Department":
            return {
                "applicant_name": data.get("name"),
                "birth_date": data.get("dob"),
                "residential_address": data.get("address"),
                "income": data.get("family_income"),
                "service_code": data.get("service")
            }

        # ---------------------------------------------
        # Education Department
        # ---------------------------------------------

        if department == "Education Department":
            return {
                "student_name": data.get("name"),
                "date_of_birth": data.get("dob"),
                "student_address": data.get("address"),
                "qualification": data.get("education"),
                "bank_account": data.get("bank_account"),
                "application_type": data.get("service")
            }

        # ---------------------------------------------
        # Social Welfare Department
        # ---------------------------------------------

        if department == "Social Welfare Department":
            return {
                "beneficiary_name": data.get("name"),
                "dob": data.get("dob"),
                "residence": data.get("address"),
                "annual_family_income": data.get("family_income"),
                "account_number": data.get("bank_account"),
                "welfare_service": data.get("service")
            }

        # ---------------------------------------------
        # Existing prototype departments
        # ---------------------------------------------

        if department == "Department A":
            return {
                "applicant_name": data.get("name"),
                "birth_date": data.get("dob"),
                "residential_address": data.get("address"),
                "service_code": data.get("service")
            }

        if department == "Department B":
            return {
                "fullName": data.get("name"),
                "dateOfBirth": data.get("dob"),
                "location": data.get("address"),
                "requestType": data.get("service")
            }

        raise ValueError(
            f"Unsupported department: {department}"
        )