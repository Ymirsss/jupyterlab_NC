import torch
from torch.utils.data import Dataset
class DummyDataset(Dataset):
    def __init__(self, *shapes, num_samples: int = 10000):
        super().__init__()
        self.shapes = shapes
        self.num_samples = num_samples
    def __len__(self):
        return self.num_samples
    def __getitem__(self, idx: int):
        sample = []
        for shape in self.shapes:
            spl = torch.rand(*shape)
            sample.append(spl)
        return sample
from torch.utils.data import DataLoader
dummy_dataset = DummyDataset((3, 224, 224), (1, ))
dummy_dataloader = DataLoader(dummy_dataset, batch_size=1)
# this is the beginning of a single code snippet
import torch
import torchvision.models as models
model = models.resnet50(pretrained=True)
model.eval()
input = torch.rand(1, 3, 224, 224)
# [coder] pytorch_inc_static_quant_fxmodel [begin] # [coder-enabled]
if "GraphModule" not in str(type(model)): # [coder-enabled]
    def eval_func(model): # [coder-enabled]
        output = model(input) # [coder-enabled]
        return 1 # [coder-enabled]
    from neural_compressor.conf.config import QuantConf # [coder-enabled]
    from neural_compressor.experimental import Quantization, common # [coder-enabled]
    quant_config = QuantConf() # [coder-enabled]
    quant_config.usr_cfg.model.framework = "pytorch_fx" # [coder-enabled]
    quantizer = Quantization(quant_config) # [coder-enabled]
    quantizer.model = common.Model(model) # [coder-enabled]
    quantizer.calib_dataloader = dummy_dataloader # [coder-enabled]
    quantizer.eval_func = eval_func # [coder-enabled]
    model = quantizer() # [coder-enabled]
    model = model.model # [coder-enabled]
    model.eval() # [coder-enabled]
# [coder] pytorch_inc_static_quant_fxmodel [end] # [coder-enabled]
with torch.no_grad():
        output = model(input)

