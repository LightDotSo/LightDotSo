// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

"use client";

import { InformationCircleIcon } from "@heroicons/react/24/solid";

import type { DeltaType, Color } from "@tremor/react";
import {
  Card,
  Grid,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  BadgeDelta,
  Flex,
  Metric,
  ProgressBar,
  AreaChart,
  Icon,
  MultiSelect,
  MultiSelectItem,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

type Kpi = {
  title: string;
  metric: string;
  progress: number;
  target: string;
  delta: string;
  deltaType: DeltaType;
};

const kpiData: Kpi[] = [
  {
    title: "Value",
    metric: "$ 12,699",
    progress: 15.9,
    target: "$ 80,000",
    delta: "13.2%",
    deltaType: "moderateIncrease",
  },
  {
    title: "Profit",
    metric: "$ 45,564",
    progress: 36.5,
    target: "$ 125,000",
    delta: "23.9%",
    deltaType: "increase",
  },
  {
    title: "Assets",
    metric: "1,072",
    progress: 53.6,
    target: "2,000",
    delta: "10.1%",
    deltaType: "moderateDecrease",
  },
];

import { useState } from "react";

const usNumberformatter = (number: number, decimals = 0) =>
  Intl.NumberFormat("us", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(Number(number))
    .toString();

const formatters: { [key: string]: any } = {
  Value: (number: number) => `$ ${usNumberformatter(number)}`,
  Profit: (number: number) => `$ ${usNumberformatter(number)}`,
  Assets: (number: number) => `${usNumberformatter(number)}`,
  Delta: (number: number) => `${usNumberformatter(number, 2)}%`,
};

const Kpis = {
  Value: "Value",
  Profit: "Profit",
  Assets: "Assets",
};

const kpiList = [Kpis.Value, Kpis.Profit, Kpis.Assets];

export type DailyPerformance = {
  date: string;
  Value: number;
  Profit: number;
  Assets: number;
};

export const performance: DailyPerformance[] = [
  {
    date: "2023-05-01",
    Value: 900.73,
    Profit: 173,
    Assets: 73,
  },
  {
    date: "2023-05-02",
    Value: 1000.74,
    Profit: 174.6,
    Assets: 74,
  },
  {
    date: "2023-05-03",
    Value: 1100.93,
    Profit: 293.1,
    Assets: 293,
  },
  {
    date: "2023-05-04",
    Value: 1200.9,
    Profit: 290.2,
    Assets: 29,
  },
];

export type ValuePerson = {
  name: string;
  leads: number;
  value: string;
  quota: string;
  variance: string;
  region: string;
  status: string;
};

export const valuePeople: ValuePerson[] = [
  {
    name: "Peter Doe",
    leads: 45,
    value: "1,000,000",
    quota: "1,200,000",
    variance: "low",
    region: "Region A",
    status: "overperforming",
  },
  {
    name: "Lena Whitehouse",
    leads: 35,
    value: "900,000",
    quota: "1,000,000",
    variance: "low",
    region: "Region B",
    status: "average",
  },
  {
    name: "Phil Less",
    leads: 52,
    value: "930,000",
    quota: "1,000,000",
    variance: "medium",
    region: "Region C",
    status: "underperforming",
  },
  {
    name: "John Camper",
    leads: 22,
    value: "390,000",
    quota: "250,000",
    variance: "low",
    region: "Region A",
    status: "overperforming",
  },
  {
    name: "Max Balmoore",
    leads: 49,
    value: "860,000",
    quota: "750,000",
    variance: "low",
    region: "Region B",
    status: "overperforming",
  },
];

const deltaTypes: { [key: string]: DeltaType } = {
  average: "unchanged",
  overperforming: "moderateIncrease",
  underperforming: "moderateDecrease",
};

export function Dashboard() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedKpi = kpiList[selectedIndex];
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const isValuePersonSelected = (valuePerson: ValuePerson) =>
    (valuePerson.status === selectedStatus || selectedStatus === "all") &&
    (selectedNames.includes(valuePerson.name) || selectedNames.length === 0);

  const areaChartArgs = {
    className: "mt-5 h-72",
    data: performance,
    index: "date",
    categories: [selectedKpi],
    colors: ["blue"] as Color[],
    showLegend: false,
    valueFormatter: formatters[selectedKpi],
    yAxisWidth: 56,
  };
  return (
    <>
      <Title>Dashboard</Title>
      <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Detail</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItemsMd={2} numItemsLg={3} className="mt-6 gap-6">
              {kpiData.map(item => (
                <Card key={item.title}>
                  <Flex alignItems="start">
                    <div className="truncate">
                      <Text>{item.title}</Text>
                      <Metric className="truncate">{item.metric}</Metric>
                    </div>
                    <BadgeDelta
                      className="bg-transparent"
                      deltaType={item.deltaType}
                    >
                      {item.delta}
                    </BadgeDelta>
                  </Flex>
                  <Flex className="mt-4 space-x-2">
                    <Text className="truncate">{`${item.progress}% (${item.metric})`}</Text>
                    <Text className="truncate">{item.target}</Text>
                  </Flex>
                  <ProgressBar value={item.progress} className="mt-2" />
                </Card>
              ))}
            </Grid>
            <div className="mt-6">
              <Card>
                <>
                  <div className="justify-between md:flex">
                    <div>
                      <Flex
                        className="space-x-0.5"
                        justifyContent="start"
                        alignItems="center"
                      >
                        <Title> Performance History </Title>
                        <Icon
                          icon={InformationCircleIcon}
                          variant="simple"
                          tooltip="Shows daily increase or decrease of particular domain"
                        />
                      </Flex>
                      <Text> Daily change per domain </Text>
                    </div>
                    <div>
                      <TabGroup
                        index={selectedIndex}
                        onIndexChange={setSelectedIndex}
                      >
                        <TabList color="gray" variant="solid">
                          <Tab>Value</Tab>
                          <Tab>Yield</Tab>
                          <Tab>Assets</Tab>
                        </TabList>
                      </TabGroup>
                    </div>
                  </div>
                  {/* web */}
                  <div className="mt-8 hidden sm:block">
                    <AreaChart {...areaChartArgs} />
                  </div>
                  {/* mobile */}
                  <div className="mt-8 sm:hidden">
                    <AreaChart
                      {...areaChartArgs}
                      startEndOnly={true}
                      showGradient={false}
                      showYAxis={false}
                    />
                  </div>
                </>
              </Card>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <>
                  <div>
                    <Flex
                      className="space-x-0.5 space-y-4"
                      justifyContent="start"
                      alignItems="center"
                    >
                      <Title> Transaction History</Title>
                      <Icon
                        icon={InformationCircleIcon}
                        variant="simple"
                        tooltip="Shows value performance per transaction"
                      />
                    </Flex>
                  </div>
                  <div className="flex space-x-2">
                    <MultiSelect
                      className="max-w-full sm:max-w-xs"
                      onValueChange={setSelectedNames}
                      placeholder="Select Valuepeople..."
                    >
                      {valuePeople.map(item => (
                        <MultiSelectItem key={item.name} value={item.name}>
                          {item.name}
                        </MultiSelectItem>
                      ))}
                    </MultiSelect>
                    <Select
                      className="max-w-full sm:max-w-xs"
                      defaultValue="all"
                      onValueChange={setSelectedStatus}
                    >
                      <SelectItem value="all">All Performances</SelectItem>
                      <SelectItem value="overperforming">
                        Overperforming
                      </SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="underperforming">
                        Underperforming
                      </SelectItem>
                    </Select>
                  </div>
                  <Table className="mt-6">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Name</TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Leads
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Value ($)
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Quota ($)
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Variance
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Region
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Status
                        </TableHeaderCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {valuePeople
                        .filter(item => isValuePersonSelected(item))
                        .map(item => (
                          <TableRow key={item.name}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">
                              {item.leads}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.value}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quota}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.variance}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.region}
                            </TableCell>
                            <TableCell className="text-right">
                              <BadgeDelta
                                className="dark:bg-background"
                                deltaType={deltaTypes[item.status]}
                                size="xs"
                              >
                                {item.status}
                              </BadgeDelta>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </>
  );
}
