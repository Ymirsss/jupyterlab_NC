# this is the beginning of a single code snippet
import torch
import torchvision.models as models
model = models.resnet50(pretrained=True)
model.eval()
input = torch.rand(1, 3, 224, 224)
with torch.no_grad():
        output = model(input)
