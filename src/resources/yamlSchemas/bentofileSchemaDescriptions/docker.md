`docker` (optional)

BentoML makes it easy to deploy a Bento to a Docker container. It provides a set of options for customizing the Docker image generated from a Bento.

The following `docker` field contains some basic Docker configurations:

```yaml
docker:
  distro: debian
  python_version: '3.8.12'
  cuda_version: '11.6.2'
  system_packages:
    - libblas-dev
    - liblapack-dev
    - gfortran
```

> 📌 **Note:**
>
> BentoML uses `BuildKit <https://github.com/moby/buildkit>`\_, a cache-efficient builder toolkit, to containerize Bentos.
>
> BuildKit comes with `Docker 18.09 <https://docs.docker.com/develop/develop-images/build_enhancements/>`_. This means
> if you are using Docker via Docker Desktop, BuildKit will be available by default. If you are using a standalone version of Docker,
> you can install BuildKit by following the instructions `here <https://github.com/docker/buildx#installing>`_.

[Documentation](https://docs.bentoml.org/en/latest/guides/build-options.html#docker)
