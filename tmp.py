# this is the beginning of a single code snippet
import torch
import torchvision.models as models
model = models.resnet50(pretrained=True)
# [coder] pytorch_jit_scriptmodel [begin] # [coder-enabled]
if "jit" not in str(type(model)): # [coder-enabled]
    import torch # [coder-enabled]
    with torch.no_grad(): # [coder-enabled]
        model.eval() # [coder-enabled]
        model = torch.jit.script(model) # [coder-enabled]
        model = torch.jit.freeze(model) # [coder-enabled]
# [coder] pytorch_jit_scriptmodel [end] # [coder-enabled]
model.eval()
input = torch.rand(1, 3, 224, 224)
model = torch.jit.trace(model, input)
with torch.no_grad():
        output = model(input)

