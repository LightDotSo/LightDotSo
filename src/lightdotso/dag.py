# Copyright 2023-2024 LightDotSo.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import random
from graphviz import Digraph


class Task:
    def __init__(self, name, func, dependencies=None, condition=None, fallback=None):
        self.name = name
        self.func = func
        self.dependencies = dependencies if dependencies else []
        self.condition = condition
        self.fallback = fallback
        self.completed = False
        self.success = None

    def run(self):
        if self.condition and not self.condition():
            print(f"Condition for {self.name} not met, skipping...")
            self.success = False
            return

        try:
            print(f"Running {self.name}...")
            self.func()
            self.completed = True
            self.success = True
            print(f"{self.name} completed successfully.")
        except Exception as e:
            print(f"Error in {self.name}: {str(e)}")
            self.success = False
            if self.fallback:
                print(f"Running fallback for {self.name}...")
                self.fallback.run()

    def is_ready(self):
        return all(dep.completed for dep in self.dependencies)

    def add_to_graph(self, graph, added_nodes):
        if self.name not in added_nodes:
            graph.node(self.name)
            added_nodes.add(self.name)
        for dep in self.dependencies:
            if dep.name not in added_nodes:
                dep.add_to_graph(graph, added_nodes)
            graph.edge(dep.name, self.name, label="dependency")
        if self.condition:
            cond_node = self.name + "_cond"
            if cond_node not in added_nodes:
                graph.node(cond_node, label="Condition", shape="diamond")
                added_nodes.add(cond_node)
            graph.edge(cond_node, self.name, label="condition true")
        if self.fallback:
            if self.fallback.name not in added_nodes:
                self.fallback.add_to_graph(graph, added_nodes)
            graph.edge(self.name, self.fallback.name, label="fallback", style="dashed")


def visualize_dag(tasks):
    dot = Digraph(comment="The Task Graph")
    added_nodes = set()
    for task in tasks:
        task.add_to_graph(dot, added_nodes)
    return dot


def task_func():
    print("Processing task...")
    if random.choice([True, False]):
        raise Exception("Simulated task failure.")


def fallback_func():
    print("Fallback executed.")


def condition_for_task3():
    return random.choice([True, False])  # Randomly returns True or False


task1 = Task("Task1", task_func)
task2 = Task(
    "Task2",
    task_func,
    dependencies=[task1],
    fallback=Task("Fallback_Task2", fallback_func),
)
task3 = Task("Task3", task_func, dependencies=[task2], condition=condition_for_task3)

tasks = [task1, task2, task3]

dot = visualize_dag(tasks)
dot.render("tmp", view=True)  # This line saves and opens the graph
