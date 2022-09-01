import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { Constants } from './constants';

class JupyterlabDeepCoderClient {
    public request(path: string, method: string, body: any): Promise<any> {
      const settings = ServerConnection.makeSettings();
      console.log("RRRRRRRRRRRRR path",path)
      const fullUrl = URLExt.join(
        settings.baseUrl,
        Constants.SHORT_PLUGIN_NAME,
        path
      );
       console.log("RRRRRRRRRRRRR url",fullUrl)
      return ServerConnection.makeRequest(
        fullUrl,
        {
          body,
          method,
          headers: new Headers({
            'Plugin-Version': Constants.PLUGIN_VERSION
          })
        },
        settings
      ).then(response => {
        if (response.status !== 200) {
          console.log("response:::",response.status)
          return response.text().then(() => {
            throw new ServerConnection.ResponseError(
              response,
              response.statusText
            );
          });
        }
        return response.text();
      });
    }
  
  }
  
  export default JupyterlabDeepCoderClient;
  