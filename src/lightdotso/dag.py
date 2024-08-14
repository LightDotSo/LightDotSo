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
import yaml


class Task:
    def __init__(self, name, dependencies=None, condition=None, fallback=None):
        self.name = name
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
                self.fallback

    def is_ready(self):
        return all(dep.completed for dep in self.dependencies)

    def add_to_graph(self, graph, added_nodes):
        if self.name not in added_nodes:
            graph.node(self.name)
            added_nodes.add(self.name)

        for dep in self.dependencies:
            dep.add_to_graph(graph, added_nodes)

            if (dep.name, self.name) not in added_nodes:
                graph.edge(dep.name, self.name, label="dependency")
                added_nodes.add((dep.name, self.name))

        if self.condition:
            cond_node = f"{self.name}_cond"
            if cond_node not in added_nodes:
                graph.node(cond_node, label="Condition", shape="diamond")
                added_nodes.add(cond_node)
            if (cond_node, self.name) not in added_nodes:
                graph.edge(cond_node, self.name, label="condition true")
                added_nodes.add((cond_node, self.name))

        if self.fallback:
            self.fallback.add_to_graph(graph, added_nodes)
            fallback_node = self.fallback.name
            if (self.name, fallback_node) not in added_nodes:
                graph.edge(self.name, fallback_node, label="fallback", style="dashed")
                added_nodes.add((self.name, fallback_node))


def fallback_func():
    print("Fallback executed.")


def condition_for_task3():
    return random.choice([True, False])  # Randomly returns True or False


def parse_condition(condition_name):
    # Example condition parsing
    if condition_name == "random_condition":
        return lambda: random.choice([True, False])
    return lambda: True


def load_tasks_from_yaml(file_path):
    with open(file_path, "r") as file:
        config = yaml.safe_load(file)
    tasks = {}
    for task_id, task_info in config["dag"].items():
        condition = (
            parse_condition(task_info.get("condition"))
            if "condition" in task_info
            else None
        )
        new_task = Task(
            name=task_info["name"],
            dependencies=[],  # Dependencies will be linked later
            condition=condition,
            fallback=None,  # Placeholder, will be linked later
        )
        tasks[task_id] = new_task

    # Assign dependencies and fallbacks
    for task_id, task_info in config["dag"].items():
        task = tasks[task_id]
        task.dependencies = [
            tasks[dep] for dep in task_info.get("after", []) if dep in tasks
        ]
        if "fallback" in task_info:
            task.fallback = tasks[task_info["fallback"]]

    return list(tasks.values())


def visualize_dag(tasks):
    dot = Digraph(comment="The Task Graph")
    added_nodes = set()
    for task in tasks:
        task.add_to_graph(dot, added_nodes)
    return dot


# Example usage
tasks = load_tasks_from_yaml("tasks/sample_dag.yaml")
dot = visualize_dag(tasks)
dot.render("tmp", view=True)
