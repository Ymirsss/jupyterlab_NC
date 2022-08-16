# this is the beginning of a single code snippet
import torch
import torchvision.models as models
model = models.resnet50(pretrained=True)
# [coder] pytorch_inc_dynamic_quantmodel [begin] # [coder-enabled]
if "GraphModule" not in str(type(model)): # [coder-enabled]
    from neural_compressor.conf.config import QuantConf # [coder-enabled]
    from neural_compressor.experimental import Quantization, common # [coder-enabled]
    quant_config = QuantConf() # [coder-enabled]
    quant_config.usr_cfg.quantization.approach = "post_training_dynamic_quant" # [coder-enabled]
    quant_config.usr_cfg.model.framework = "pytorch" # [coder-enabled]
    quantizer = Quantization(quant_config) # [coder-enabled]
    quantizer.model = common.Model(model) # [coder-enabled]
    model = quantizer() # [coder-enabled]
    model = model.model # [coder-enabled]
    model.eval() # [coder-enabled]
# [coder] pytorch_inc_dynamic_quantmodel [end] # [coder-enabled]
model.eval()
input = torch.rand(1, 3, 224, 224)
with torch.no_grad():
        output = model(input)
