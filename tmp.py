# this is the beginning of a single code snippet
import torch
import torchvision
# this is the beginning of a single code snippet
torch.cuda.synchronize()
torch.cuda.empty_cache()

device = torch.device('cuda:0')
torch.cuda.set_device()

model = B.SomeModel.to('cuda')
model = B.SomeModel.to(device)

X = torch.randn(16, 3, 224, 224)
X2 = torch.ones(16, 3, 224, 224)

X = X.cuda()
X2 = torch.tensor(X2, device='cuda')

torch.cuda.synchronize()
