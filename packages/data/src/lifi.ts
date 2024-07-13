// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export type LifiQuotePageData = {
  id?: string;
  type?: string;
  tool?: string;
  action?: {
    fromChainId?: number;
    toChainId?: number;
    fromToken?: {
      address?: string;
      decimals?: number;
      symbol?: string;
      chainId?: number;
      coinKey?: string;
      name?: string;
      logoURI?: string;
    };
    toToken?: {
      address?: string;
      decimals?: number;
      symbol?: string;
      chainId?: number;
      coinKey?: string;
      name?: string;
      logoURI?: string;
    };
    fromAmount?: string;
    fromAddress?: string;
    toAddress?: string;
    slippage?: number;
  };
  estimate?: {
    fromAmount?: string;
    toAmount?: string;
    toAmountMin?: string;
    approvalAddress?: string;
    feeCosts?: {
      name?: string;
      description?: string;
      percentage?: string;
      token?: {
        address?: string;
        decimals?: number;
        symbol?: string;
        chainId?: number;
        coinKey?: string;
        name?: string;
        logoURI?: string;
      };
      amount?: string;
      amountUSD?: string;
      included?: boolean;
    }[];
    gasCosts?: {
      type?: string;
      price?: string;
      estimate?: string;
      limit?: string;
      amount?: string;
      amountUSD?: string;
      token?: {
        address?: string;
        symbol?: string;
        decimals?: number;
        chainId?: number;
        name?: string;
        coinKey?: string;
        priceUSD?: string;
        logoURI?: string;
      };
    }[];
    data?: {
      bid?: {
        user?: string;
        router?: string;
        initiator?: string;
        sendingChainId?: number;
        sendingAssetId?: string;
        amount?: string;
        receivingChainId?: number;
        receivingAssetId?: string;
        amountReceived?: string;
        receivingAddress?: string;
        transactionId?: string;
        expiry?: number;
        callDataHash?: string;
        callTo?: string;
        encryptedCallData?: string;
        sendingChainTxManagerAddress?: string;
        receivingChainTxManagerAddress?: string;
        bidExpiry?: number;
      };
      bidSignature?: string;
      gasFeeInReceivingToken?: string;
      metaTxRelayerFee?: string;
    };
  };
  integrator?: string;
  execution?: {
    status?: string;
    process?: {
      id?: string;
      startedAt?: number;
      message?: string;
      status?: string;
      txHash?: string;
      txLink?: string;
      doneAt?: number;
    }[];
  };
};
