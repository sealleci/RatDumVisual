import asyncio

from dumtrain.network.sender import InterSender
from dumtrain.train.trainer import DummyTrainer


async def main():
    host = "localhost"
    port = 11451
    keys_to_iter = [["blue", "platforminfos"], ["red", "platforminfos"]]
    trainer_sender = InterSender(host, port, keys_to_iter, "Trainer")
    trainer = DummyTrainer(trainer_sender)
    await asyncio.gather(trainer_sender.start(), trainer.run())


if __name__ == "__main__":
    asyncio.run(main())
