# this is the beginning of a single code snippet
import glob
import torch
import os
import sys
from tqdm import tqdm
from dalle_pytorch import VQGanVAE, DALLE, DiscreteVAE
from dalle_pytorch.tokenizer import tokenizer
from einops import repeat
from dalle_nc import DALLE, DiscreteVAE
from torch.utils.data import DataLoader
from torch.utils.data import Dataset

# model
vae = DiscreteVAE(
    image_size = 8,
    num_layers = 3,
    num_tokens = 8192,
    codebook_dim = 1024,
    hidden_dim = 64,
    num_resnet_blocks = 1,
    temperature = 0.9
)

dalle = DALLE(
    dim = 1024,
    vae = vae,                  # automatically infer (1) image sequence length and (2) number of image tokens
    num_text_tokens = 100000,    # vocab size for text
    text_seq_len = 256,         # text sequence length
    depth = 12,                 # should aim to be 64
    heads = 16,                 # attention heads
    dim_head = 64,              # attention head dimension
    attn_dropout = 0.1,         # attention dropout
    ff_dropout = 0.1            # feedforward dropout
)
# [NeuralCoder] pytorch_inc_dynamic_quant for dalle [Beginning Line]
if "GraphModule" not in str(type(dalle)):
    from neural_compressor.conf.config import QuantConf
    from neural_compressor.experimental import Quantization, common
    quant_config = QuantConf()
    quant_config.usr_cfg.quantization.approach = "post_training_dynamic_quant"
    quant_config.usr_cfg.model.framework = "pytorch"
    quantizer = Quantization(quant_config)
    quantizer.model = common.Model(dalle)
    dalle = quantizer()
    dalle = dalle.model
    dalle.eval()
# [NeuralCoder] pytorch_inc_dynamic_quant for dalle [Ending Line]

dalle.eval()

# real data for DALLE image generation
files = glob.glob("/home2/longxin/Neural_Coder_EXT/real_text.txt")

# create dataloader
input_list = []
with torch.no_grad():
    count = 0
    for file in files:
        texts = open(file, 'r').read().split('\n')
        for text in texts:
            print(text)

            num_images = 1

            top_k = 0.9

            image_size = vae.image_size

            texts = text.split('|')

            for j, text in tqdm(enumerate(texts)):
                text_tokens = tokenizer.tokenize([text], 256).to('cpu')

                text_tokens = repeat(text_tokens, '() n -> b n', b=num_images)

                for text_chunk in tqdm(text_tokens):
                    d = {}
                    d["text"] = text_chunk
                    d["filter_thres"] = top_k
                    input_list.append(d)

class MyDataset(Dataset):
    def __init__(self):
        self.samples = input_list

    def __getitem__(self, idx):
        return self.samples[idx], 1

    def __len__(self):
        return len(self.samples)
dataset = MyDataset()
dataloader = DataLoader(dataset)

# inference
with torch.no_grad():
    for step, (inputs, labels) in enumerate(dataloader):
        print("running inference ...")
        output = dalle(**inputs)
