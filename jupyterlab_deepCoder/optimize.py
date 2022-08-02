import abc
import copy
import importlib
import logging
import re
import subprocess
import sys
from functools import wraps
from typing import List, Type

import pkg_resources

try:
    import rpy2
    import rpy2.robjects
except ImportError:
    pass
from packaging import version

logger = logging.getLogger(__name__)


INCOMPATIBLE_MAGIC_LANGUAGES = [
    "html",
    "js",
    "javascript",
    "latex",
    "perl",
    "markdown",
    "ruby",
    "script",
    "sh",
    "svg",
    "bash",
    "info",
    "cleanup",
    "delete",
    "configure",
    "logs",
    "sql",
    "local",
    "sparksql",
]


class BaseOptimizer(abc.ABC):
    @property
    @abc.abstractmethod
    def label(self) -> str:
        pass

    @property
    @abc.abstractmethod
    def importable(self) -> bool:
        pass

    @abc.abstractmethod
    def optimize_code(self, code: str, notebook: bool, **options) -> str:
        pass


class BaseLineEscaper(abc.ABC):
    """A base class for defining how to escape certain sequence of text to avoid formatting."""

    def __init__(self, code: str) -> None:
        self.code = code

    @property
    @abc.abstractmethod
    def langs(self) -> List[str]:
        return

    @abc.abstractmethod
    def escape(self, line: str) -> str:
        pass

    @abc.abstractmethod
    def unescape(self, line: str) -> str:
        pass


class MagicCommandEscaper(BaseLineEscaper):
    langs = ["python"]
    escaped_line_start = "# \x01 "
    unesacpe_start = len(escaped_line_start)

    def escape(self, line: str) -> str:
        if line.lstrip().startswith("%"):
            line = f"{self.escaped_line_start}{line}"
        return line

    def unescape(self, line: str) -> str:
        if line.lstrip().startswith(self.escaped_line_start):
            line = line[self.unesacpe_start :]
        return line


class RunScriptEscaper(BaseLineEscaper):
    langs = ["python"]
    escaped_line_start = "# \x01 "
    unesacpe_start = len(escaped_line_start)

    def escape(self, line: str) -> str:
        if re.match(pattern="run\s+\w+", string=line.lstrip()):
            line = f"{self.escaped_line_start}{line}"
        return line

    def unescape(self, line: str) -> str:
        if line.lstrip().startswith(self.escaped_line_start):
            line = line[self.unesacpe_start :]
        return line


class HelpEscaper(BaseLineEscaper):

    langs = ["python"]
    escaped_line_start = "# \x01 "
    unesacpe_start = len(escaped_line_start)

    def escape(self, line: str) -> str:
        lstripped = line.lstrip()
        if (
            line.endswith("??")
            or line.endswith("?")
            or lstripped.startswith("?")
            or lstripped.startswith("??")
        ) and "#" not in line:
            line = f"{self.escaped_line_start}{line}"
        return line

    def unescape(self, line: str) -> str:
        if line.lstrip().startswith(self.escaped_line_start):
            line = line[self.unesacpe_start :]
        return line


class CommandEscaper(BaseLineEscaper):

    langs = ["python"]
    escaped_line_start = "# \x01 "
    unesacpe_start = len(escaped_line_start)

    def escape(self, line: str) -> str:
        if line.lstrip().startswith("!"):
            line = f"{self.escaped_line_start}{line}"
        return line

    def unescape(self, line: str) -> str:
        if line.lstrip().startswith(self.escaped_line_start):
            line = line[self.unesacpe_start :]
        return line


class QuartoCommentEscaper(BaseLineEscaper):

    langs = ["python"]
    escaped_line_start = "# \x01 "
    unesacpe_start = len(escaped_line_start)

    def escape(self, line: str) -> str:
        if line.lstrip().startswith("#| "):
            line = f"{self.escaped_line_start}{line}"
        return line

    def unescape(self, line: str) -> str:
        if line.lstrip().startswith(self.escaped_line_start):
            line = line[self.unesacpe_start :]
        return line


ESCAPER_CLASSES: List[Type[BaseLineEscaper]] = [
    MagicCommandEscaper,
    HelpEscaper,
    CommandEscaper,
    QuartoCommentEscaper,
    RunScriptEscaper,
]


def handle_line_ending_and_magic(func):
    @wraps(func)
    def wrapped(self, code: str, notebook: bool, **options) -> str:
        if any(
            code.startswith(f"%{lang}") for lang in INCOMPATIBLE_MAGIC_LANGUAGES
        ) or any(code.startswith(f"%%{lang}") for lang in INCOMPATIBLE_MAGIC_LANGUAGES):
            logger.info("Non compatible magic language cell block detected, ignoring.")
            return code

        has_semicolon = code.strip().endswith(";")

        escapers = [escaper_cls(code) for escaper_cls in ESCAPER_CLASSES]

        lines = code.splitlines()
        for escaper in escapers:
            lines = map(escaper.escape, lines)
        code = "\n".join(lines)

        code = func(self, code, notebook, **options)

        lines = code.splitlines()
        lines.append("")

        for escaper in escapers:
            lines = map(escaper.unescape, lines)
        code = "\n".join(lines)

        if notebook:
            code = code.rstrip()

        if has_semicolon and notebook and not code.endswith(";"):
            code += ";"
        return code

    return wrapped


BLUE_MONKEY_PATCHED = False


def is_importable(pkg_name: str) -> bool:
    # Need to reload for packages are installed/uninstalled after JupyterLab started
    importlib.reload(pkg_resources)

    return pkg_name in {pkg.key for pkg in pkg_resources.working_set}


def import_black():
    global BLUE_MONKEY_PATCHED
    if BLUE_MONKEY_PATCHED:
        for module in list(sys.modules):
            if module.startswith("black."):
                importlib.reload(sys.modules[module])

        import black

        black = importlib.reload(black)
        BLUE_MONKEY_PATCHED = False
    else:
        import black

    return black


def import_blue():
    """Import blue and perform monkey patch."""
    global BLUE_MONKEY_PATCHED
    import blue

    if not BLUE_MONKEY_PATCHED:
        blue.monkey_patch_black(blue.Mode.synchronous)
        BLUE_MONKEY_PATCHED = True

    return blue



class Cuda_to_CPU_optimizer(BaseOptimizer):

    label = "Apply CUDA to CPU Optimizer"

    @property
    def importable(self) -> bool:
        # TODO: What happens on windows??
        proc = subprocess.run(["which", "python"], stdout=subprocess.PIPE)
        return proc.returncode == 0

    @handle_line_ending_and_magic
    def optimize_code(self, code: str, notebook: bool, **options) -> str:
        import subprocess

        process = subprocess.run(
            [
                "rustfmt",
            ],
            input=code,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
        )

        if process.stderr:
            logger.info("An error with rustfmt has ocurred:")
            logger.info(process.stderr)
            return code
        else:
            return process.stdout

SERVER_OPTIMIZERS = {
    "pytorch_cuda_to_cpu": Cuda_to_CPU_optimizer(),
}
