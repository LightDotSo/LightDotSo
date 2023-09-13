#!/bin/sh
# Copyright (C) 2023 Light, Inc.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


## Disable hole punchibng
ipfs config --json Swarm.RelayClient.Enabled true
ipfs config --json Swarm.EnableHolePunching true

## Bind API to all interfaces so that fly proxy for the Kubo API works
ipfs config --json Addresses.API '["/ip4/0.0.0.0/tcp/5001", "/ip6/::/tcp/5001"]'

## For internal networking
ipfs config --json Addresses.Gateway '["/ip4/0.0.0.0/tcp/8080","/ip6/::/tcp/8080"]'
