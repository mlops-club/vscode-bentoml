`service` (required) is a **required** field and points to where a [Service object](https://docs.bentoml.org/en/latest/guides/services.html) resides.

It is often defined as `service: "service:class-name"`.

- `service`: The Python module, namely the `service.py` file.
- `class-name`: The class-based Service's name created in `service.py`, decorated with `@bentoml.service`.

If you have multiple Services in `service.py`, you can specify the main Service receiving user requests in `bentofile.yaml`.

Other Services will be started together with this main Service.

[Documentation](https://docs.bentoml.org/en/latest/guides/build-options.html#service)
