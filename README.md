# Jupyterlab_NeuralCoder

[![Github Actions Status](https://github.com/Ymirsss/jupyterlab_NC/workflows/Build/badge.svg)](https://github.com/Ymirsss/jupyterlab_NC/actions/workflows/build.yml)[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/Ymirsss/jupyterlab_NC/main?urlpath=lab)
Neural_Coder_EXT

## Requirements

- JupyterLab >= 3.0

## Install
Before install, you should install the NeuralCoder, please refer to https://github.com/intel-sandbox/neural-coder/blob/master/neural_coder/README.md

To install the python source code, execute:

```bash
pip install -e.
```
or
```bash
python setup.py install
```
To enables the package to bacome a lab extension
```bash
jupyter labextension enable --py jupyterlab_deepCoder
```
Check if the package is added into the extension list:
```bash
jupyter labextension list
jupyter serverextension list
```
build extension Typescript source:
```bash
jlpm run build
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_deepCoder
```
## Access jupyter lab remotely using SSH

Launch the jupyter lab service on the remote server:
```bash
jupyter lab --no-browser --port=8889
```
Start SSH in a local terminal:
```bash
ssh -N -f -L localhost:8888:localhost:8889 username@serverIP
```
## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the Neural_Coder directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall Neural_Coder
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `Neural_Coder` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro/) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
