import asyncio
from typing import TypeAlias

from dumtrain.network.sender import Sender

Str2dList: TypeAlias = list[list[str]]


class Server:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.server: asyncio.Server | None = None

    async def handle_client(
        self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ):
        while True:
            raw_data = await reader.readline()
            if not raw_data:
                break
            print(f"Sever> Received data: {raw_data.decode()}")

        writer.close()

    async def start(self):
        self.server = await asyncio.start_server(
            self.handle_client, self.host, self.port
        )
        print("Server> Started.")

        async with self.server:
            await self.server.serve_forever()

    async def stop(self):
        if self.server:
            self.server.close()
            await self.server.wait_closed()


class InterServer(Server):
    def __init__(self, host: str, port: int, keys_to_iter: Str2dList, sender: Sender):
        super().__init__(host, port)
        self.keys_to_iter = keys_to_iter
        self.sender = sender

    async def handle_client(
        self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ):
        while True:
            raw_data = await reader.readline()

            if not raw_data:
                break

            print("Sever> Received data.")

            transfer_data = {"keys_to_iter": self.keys_to_iter, "data": raw_data.decode().rstrip("\n")}
            await self.sender.put_data(transfer_data)

        writer.close()
