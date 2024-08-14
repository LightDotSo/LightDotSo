from graphviz import Digraph
import random


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


task1 = Task("Task1", task_func)
task2 = Task(
    "Task2",
    task_func,
    dependencies=[task1],
    fallback=Task("Fallback_Task2", fallback_func),
)
task3 = Task("Task3", task_func, dependencies=[task2])

tasks = [task1, task2, task3]

dot = visualize_dag(tasks)
dot.render("task_graph", view=True)
