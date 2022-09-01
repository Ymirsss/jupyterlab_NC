import json

import pkg_resources
from jupyter_server.base.handlers import APIHandler
from jupyter_server.serverapp import ServerWebApplication
from jupyter_server.utils import url_path_join
from pathlib import Path
from neural_coder import enable
import subprocess

HERE = Path(__file__).parent.parent.resolve()
TMP_FILE = "tmp.py"
Auto_File = "temp_optimized.py"

def setup_handlers(web_app: ServerWebApplication) -> None:
    host_pattern = ".*$"
    web_app.add_handlers(
        host_pattern,
        [
            (
                url_path_join(
                    web_app.settings["base_url"],
                    "/jupyterlab_deepCoder/optimize",
                ),
                OptimizeAPIHandler,
            )
        ],
    )
    web_app.add_handlers(
        host_pattern,
        [
            (
                url_path_join(
                    web_app.settings["base_url"],
                    "/jupyterlab_deepCoder/save",
                ),
                SaveAPIHandler,
            )
        ],
    )
    web_app.add_handlers(
        host_pattern,
        [
            (
                url_path_join(
                    web_app.settings["base_url"], "/jupyterlab_deepCoder/version"
                ),
                VersionAPIHandler,
            )
        ],
    )


def check_plugin_version(handler: APIHandler):
    server_extension_version = pkg_resources.get_distribution(
        "jupyterlab_deepCoder"
    ).version
    lab_extension_version = handler.request.headers.get("Plugin-Version")
    version_matches = server_extension_version == lab_extension_version
    if not version_matches:
        handler.set_status(
            422,
            f"Mismatched versions of server extension ({server_extension_version}) "
            f"and lab extension ({lab_extension_version}). "
            f"Please ensure they are the same.",
        )
        handler.finish()
    return version_matches


class SaveAPIHandler(APIHandler):
   def post(self) -> None:
      data = json.loads(self.request.body.decode("utf-8"))
      log = data["text"]
      path = data["path"]
      with open( path, 'w+' ) as f:     
        log_list = log.split("\n")
        for line in log_list:
            f.write(line+"\n")
      
      self.finish(json.dumps({"save": "success"}))
      
      
      
      
      
class OptimizeAPIHandler(APIHandler):

    def read(self, file):
       with open(file, 'r') as f:
         content = f.read()
       return content
       
    def cmd(self,command):
        subp = subprocess.Popen(command,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,encoding="utf-8")
        subp.wait(2)
        if subp.poll() == 0:
            print("?????????????????????")
            print("subp comnunicate!",subp.communicate()[0].replace("Model name:","").strip())
        else:
            print("fail to get system info")
        return subp.communicate()[0].replace("Model name:","").strip()
    
    
    def post(self) -> None:
        print("backend, arrive 1")

        if self.get_query_argument(
            "bypassVersionCheck", default=None
        ) is not None or check_plugin_version(self):
            print("backend, arrive 2")

            data = json.loads(self.request.body.decode("utf-8"))
            print("Handle optimize request")
            notebook = data["notebook"]
            options = data["options"]
            feature = data['formatter']
            optimized_code = []
            print("received opts:", options)
            print("backend, arrive 3")

            with open( HERE/TMP_FILE, 'w+' ) as f:
                for code in data["code"]:
                    f.write("# this is the beginning of a single code snippet\n")
                    code_list = code.split("\n")
                    for line in code_list:
                        f.write(line+"\n")
            print("received code: ",code_list)
            print("received feature",feature)
            args="--model_name_or_path albert-base-v2 --task_name sst2 --do_eval --output_dir result"
            from neural_coder import enable
            if(options != "normal"):
                if (feature == ''):
                  print("run bench...")
                  print(type(options))
                  print(options)
                  perfomance, mode, path = enable(code=str(HERE/TMP_FILE),features=[], run_bench=True, args=options)
                  
                  with open(path + '/bench.log', 'r') as f:
                     logs = f.readlines()
                  log_line = logs[4]
                  log = log_line.split("[")[1].split("]")[0]
                  self.finish(json.dumps({"log": log, "perfomance": perfomance, "path": path}))
                else:
                
                  print("auto quant...")
                  print(type(options))
                  perfomance, mode, path = enable(code=str(HERE/TMP_FILE), features=[feature], run_bench=True, overwrite=True, args=options)
                  print("pytorch_inc_dynamic_quant....")
                  print(perfomance)
                  print(mode)
                  print(path)
                  content = self.read(HERE/TMP_FILE)
                  optimized_code = content.split("# this is the beginning of a single code snippet\n")[1:]
                  with open(path + '/bench.log', 'r') as f:
                     logs = f.readlines()
                  log_line = logs[4]
                  log = log_line.split("[")[1].split("]")[0]
                  print("log...", log)
                  self.finish(json.dumps({"code": optimized_code,"log": log, "perfomance": perfomance, "path": path, "hardware":self.cmd("lscpu | grep 'Model name'")}))
                
            else:
                enable(code=str(HERE/TMP_FILE), features=[feature], overwrite=True)
                content = self.read(HERE/TMP_FILE)
                optimized_code = content.split("# this is the beginning of a single code snippet\n")[1:]
                self.finish(json.dumps({"code": optimized_code}))

class VersionAPIHandler(APIHandler):
    def get(self) -> None:
        """Show what version is this server plguin on."""
        self.finish(
            json.dumps(
                {
                    "version": pkg_resources.get_distribution(
                        "jupyterlab_neuralcoder"
                    ).version
                }
            )
        )
