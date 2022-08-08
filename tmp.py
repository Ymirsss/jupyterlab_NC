# this is the beginning of a single code snippet
import torch
import torchvision

device = torch.device('cpu')

model = B.SomeModel.to('cpu')
model = B.SomeModel.to(device)

X = torch.randn(16, 3, 224, 224)
X2 = torch.ones(16, 3, 224, 224)

X = X.cpu()
X2 = torch.tensor(X2, device='cpu')
