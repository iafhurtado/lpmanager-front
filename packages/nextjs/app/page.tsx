"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BeakerIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">MXNb-USDT LP Manager Bitso Hack</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <p className="text-center text-lg">
            This is a hackathon project built by{" "}
            <a
              href="https://x.com/0xdcota"
              target="_blank"
              rel="noopener noreferrer"
              className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block hover:underline"
            >
              @0xdcota
            </a>{" "}
            and{" "}
            <a
              href="https://x.com/iafhurtado"
              target="_blank"
              rel="noopener noreferrer"
              className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block hover:underline"
            >
              @iafhurtado
            </a>
          </p>
          <p className="text-center text-lg">
            Using Scaffold-Eth 2.0, we built a liquidity manager front end for the MXNb-USDT LP.{" "}
          </p>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BeakerIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with our smart contract using the{" "}
                <Link href="/liquidity-manager" passHref className="link">
                  Liquidity Manager
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
