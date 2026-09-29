from synapflow.service_registry import ServiceRegistry
from synapflow.normalizer import SynapFlowNormalizer
from synapflow.adapter import DepartmentAdapter


class SynapFlowWorkflow:
    """
    Main interoperability workflow of SynapFlow.

    Coordinates:
    1. Service requirement resolution
    2. Department discovery
    3. Data normalization
    4. Department adapters
    5. Multi-department submission
    """

    @staticmethod
    def process(application: dict) -> dict:

        service_name = application["service"]

        # -------------------------------------------------
        # Step 1: Resolve service requirements
        # -------------------------------------------------

        service = ServiceRegistry.get_service(service_name)

        if not service:
            raise ValueError(
                f"Unsupported service: {service_name}"
            )

        departments = service["departments"]

        # -------------------------------------------------
        # Step 2: Process application for every department
        # -------------------------------------------------

        department_results = []

        for department in departments:

            # Convert canonical data into the
            # target department's expected format
            normalized_payload = SynapFlowNormalizer.transform(
                application,
                department
            )

            # Send through the appropriate adapter
            department_response = DepartmentAdapter.send(
                department,
                normalized_payload
            )

            department_results.append({
                "department": department,
                "normalized_payload": normalized_payload,
                "department_response": department_response,
                "status": "SUBMITTED"
            })

        # -------------------------------------------------
        # Step 3: Return unified result
        # -------------------------------------------------

        return {
            "service": service["service_name"],
            "departments": departments,
            "required_fields": service["fields"],
            "required_documents": service["documents"],
            "workflow": service["workflow"],
            "department_results": department_results
        }