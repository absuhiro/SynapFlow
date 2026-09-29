class ServiceRegistry:
    """
    Central registry for SynapFlow services.

    Each service defines:
    - participating departments
    - required fields
    - required documents
    - workflow stages
    """

    SERVICES = {

        "student welfare scholarship": {
            "service_name": "Student Welfare & Scholarship",

            "departments": [
                "Education Department",
                "Revenue Department",
                "Social Welfare Department"
            ],

            "fields": [
                "name",
                "dob",
                "address",
                "education",
                "family_income",
                "bank_account"
            ],

            "documents": [
                "identity_proof",
                "marksheet",
                "income_proof",
                "bank_proof"
            ],

            "workflow": [
                "APPLICATION_SUBMITTED",
                "IDENTITY_VERIFICATION",
                "INCOME_VERIFICATION",
                "EDUCATION_VERIFICATION",
                "DEPARTMENT_REVIEW",
                "FINAL_DECISION"
            ]
        },

        "income certificate": {
            "service_name": "Income Certificate",

            "departments": [
                "Revenue Department"
            ],

            "fields": [
                "name",
                "dob",
                "address",
                "family_income"
            ],

            "documents": [
                "identity_proof",
                "address_proof",
                "income_proof"
            ],

            "workflow": [
                "APPLICATION_SUBMITTED",
                "DOCUMENT_VERIFICATION",
                "DEPARTMENT_REVIEW",
                "FINAL_DECISION"
            ]
        },

        "domicile certificate": {
            "service_name": "Domicile Certificate",

            "departments": [
                "Revenue Department"
            ],

            "fields": [
                "name",
                "dob",
                "address"
            ],

            "documents": [
                "identity_proof",
                "address_proof"
            ],

            "workflow": [
                "APPLICATION_SUBMITTED",
                "DOCUMENT_VERIFICATION",
                "DEPARTMENT_REVIEW",
                "FINAL_DECISION"
            ]
        },

        "scholarship": {
            "service_name": "Scholarship",

            "departments": [
                "Education Department",
                "Revenue Department"
            ],

            "fields": [
                "name",
                "dob",
                "address",
                "education",
                "family_income",
                "bank_account"
            ],

            "documents": [
                "identity_proof",
                "marksheet",
                "income_proof",
                "bank_proof"
            ],

            "workflow": [
                "APPLICATION_SUBMITTED",
                "INCOME_VERIFICATION",
                "EDUCATION_VERIFICATION",
                "DEPARTMENT_REVIEW",
                "FINAL_DECISION"
            ]
        }
    }

    @classmethod
    def get_service(cls, service_name: str):
        """
        Return the complete definition of a service.
        """

        key = service_name.strip().lower()

        return cls.SERVICES.get(key)

    @classmethod
    def get_departments(cls, service_name: str):
        """
        Return all departments involved in a service.
        """

        service = cls.get_service(service_name)

        if not service:
            return []

        return service["departments"]

    @classmethod
    def get_fields(cls, service_name: str):
        """
        Return the unified fields required by a service.
        """

        service = cls.get_service(service_name)

        if not service:
            return []

        return service["fields"]

    @classmethod
    def get_documents(cls, service_name: str):
        """
        Return documents required by a service.
        """

        service = cls.get_service(service_name)

        if not service:
            return []

        return service["documents"]

    @classmethod
    def get_workflow(cls, service_name: str):
        """
        Return workflow stages for a service.
        """

        service = cls.get_service(service_name)

        if not service:
            return []

        return service["workflow"]

    @classmethod
    def list_services(cls):
        """
        Return all available services.
        """

        return [
            service["service_name"]
            for service in cls.SERVICES.values()
        ]