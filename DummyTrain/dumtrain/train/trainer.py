from asyncio import sleep
from random import randint, random
from typing import Any, TypeAlias

from dumtrain.network.sender import Sender

AnyDict: TypeAlias = dict[str, Any]


class DummyTrainer:
    def __init__(self, sender: Sender):
        self.sender = sender

    @staticmethod
    def gen_obs(side_member_num: int) -> AnyDict:
        def gen_agent_info(side_name: str, serial_num: int) -> AnyDict:
            return {
                "Name": f"{side_name}{serial_num}",
                "X": random() * 8000,
                "Y": random() * 8000,
                "Altitude": random() * 500 + 2000,
                "Heading": random(),
                "Pitch": random(),
                "Roll": 0.0,
                "Speed": random() * 100 + 100,
                "Missles": randint(0, 5),
            }

        return {
            "blue": {
                "platforminfos": [
                    gen_agent_info("blue", x) for x in range(side_member_num)
                ]
            },
            "red": {
                "platforminfos": [
                    gen_agent_info("red", x) for x in range(side_member_num)
                ]
            },
        }

    async def run(self):
        espisode: int = 0

        while True:
            print(f"Trainer> Episode: {espisode}")
            obs = DummyTrainer.gen_obs(5)
            await self.sender.put_data(obs)
            espisode += 1
            await sleep(2.0)
