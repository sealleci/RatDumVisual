import asyncio
import json
from typing import Any, TypeAlias

AnyDict: TypeAlias = dict[str, Any]
Str2dList: TypeAlias = list[list[str]]


class Sender:
    def __init__(self, host: str, port: int, owner: str = ""):
        self.owner = owner
        self.host = host
        self.port = port
        self.queue: asyncio.Queue[AnyDict] = asyncio.Queue()

    async def put_data(self, data: AnyDict):
        await self.queue.put(data)

    async def start(self):
        writer = None
        while True:
            try:
                _, writer = await asyncio.open_connection(self.host, self.port)
                break
            except ConnectionError:
                await asyncio.sleep(0.1)

        print(f"{self.owner}@Sender> Connected to server.")

        while True:
            try:
                data = await self.queue.get()
                dumped_data = json.dumps(data)
                dumped_data += "\n"
                writer.write(dumped_data.encode())
                await writer.drain()
                print(f"{self.owner}@Sender> Sent data to server.")
            except ConnectionError:
                continue


class InterSender(Sender):
    def __init__(self, host: str, port: int, keys_to_iter: Str2dList, owner: str = ""):
        super().__init__(host, port, owner)
        self.keys_to_iter = keys_to_iter

    async def start(self):
        writer = None
        while True:
            try:
                _, writer = await asyncio.open_connection(self.host, self.port)
                break
            except ConnectionError:
                await asyncio.sleep(0.1)

        print(f"{self.owner}@Sender> Connected to server.")

        while True:
            try:
                data = await self.queue.get()
                transfer_data = {"keys_to_iter": self.keys_to_iter, "data": data}
                dumped_data = json.dumps(transfer_data)
                writer.write(dumped_data.encode())
                await writer.drain()
                print(f"{self.owner}@Sender> Sent data to server.")
            except ConnectionError:
                continue
