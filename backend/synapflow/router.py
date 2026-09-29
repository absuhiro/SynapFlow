class SynapFlowRouter:
    """
    SynapFlow routing engine.

    Determines which government department should
    receive an application based on the requested service.
    """

    SERVICE_ROUTES = {
        "income certificate": "Department A",
        "domicile certificate": "Department A",
        "scholarship": "Department B",
    }

    @classmethod
    def route(cls, service: str) -> str:
        """
        Return the department responsible for the service.
        """

        service_name = service.strip().lower()

        return cls.SERVICE_ROUTES.get(
            service_name,
            "Department B"
        )