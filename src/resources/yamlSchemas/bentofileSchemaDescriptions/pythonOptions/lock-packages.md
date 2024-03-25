(optional) Whether to lock the packages.

By default, BentoML automatically locks all package versions, as well as all packages in their dependency graph, to the versions found in the current build environment, and generates a `requirements.lock.txt` file.

This process uses [pip-compile](https://github.com/jazzband/pip-tools) under the hood.

If you have already specified a version for all packages, you can optionally disable this behavior by setting the `lock_packages` field to `false`:

```yaml
python:
  requirements_txt: 'requirements.txt'
  lock_packages: false
```

---

You might choose to disable this if the included `requirements.txt` file or specified packages already have pinned versions of primary and transitive dependencies.

Bear in mind that lockfiles in Python are never guaranteed to be platform-agnostic.

In other words, lockfiles should typically be generated on the same platform, e.g. OS that the bento will run with.

[Documentation](https://docs.bentoml.org/en/latest/guides/build-options.html#pypi-package-locking)
