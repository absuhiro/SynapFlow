from mock_departments.department_a import process_application as process_department_a
from mock_departments.department_b import process_application as process_department_b
from mock_departments.revenue_department import process_application as process_revenue
from mock_departments.education_department import process_application as process_education
from mock_departments.social_welfare_department import process_application as process_social_welfare


class DepartmentAdapter:
    """
    Adapter layer between SynapFlow and departmental systems.

    SynapFlow uses one common interface while each department
    can have a different API, schema or implementation.
    """

    @staticmethod
    def send(department: str, payload: dict) -> dict:

        if department == "Revenue Department":
            return process_revenue(payload)

        if department == "Education Department":
            return process_education(payload)

        if department == "Social Welfare Department":
            return process_social_welfare(payload)

        # Existing prototype departments
        if department == "Department A":
            return process_department_a(payload)

        if department == "Department B":
            return process_department_b(payload)

        raise ValueError(
            f"Unsupported department: {department}"
        )