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

#![allow(clippy::unwrap_used)]

use dagrs::{Action, CommandAction, Dag, DagError, Parser, Task};
use serde::Deserialize;
use serde_yaml::from_str;
use std::{
    collections::HashMap,
    fmt::{Display, Formatter},
    fs,
    sync::Arc,
};

#[derive(Debug, Deserialize)]
struct YamlConfig {
    dag: HashMap<String, TaskInfo>,
}

#[derive(Debug, Deserialize)]
struct TaskInfo {
    name: String,
    #[serde(default)]
    after: Vec<String>,
    #[serde(default)]
    condition: Option<String>,
    #[serde(default)]
    fallback: Option<String>,
}

struct MyTask {
    tid: (String, usize),
    name: String,
    precursors: Vec<String>,
    precursors_id: Vec<usize>,
    action: Action,
    condition: Option<String>,
    fallback: Option<String>,
}

impl MyTask {
    pub fn new(
        txt_id: &str,
        precursors: Vec<String>,
        name: String,
        action: CommandAction,
        condition: Option<String>,
        fallback: Option<String>,
    ) -> Self {
        Self {
            tid: (txt_id.to_owned(), dagrs::alloc_id()),
            name,
            precursors,
            precursors_id: Vec::new(),
            action: Action::Structure(Arc::new(action)),
            condition,
            fallback,
        }
    }

    pub fn init_precursors(&mut self, pres_id: Vec<usize>) {
        self.precursors_id = pres_id;
    }

    pub fn str_precursors(&self) -> Vec<String> {
        self.precursors.clone()
    }

    pub fn str_id(&self) -> String {
        self.tid.0.clone()
    }
}

impl Task for MyTask {
    fn action(&self) -> Action {
        self.action.clone()
    }
    fn precursors(&self) -> &[usize] {
        &self.precursors_id
    }
    fn id(&self) -> usize {
        self.tid.1
    }
    fn name(&self) -> &str {
        &self.name
    }
}

impl Display for MyTask {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{},{},{},{:?},condition:{:?},fallback:{:?}",
            self.name, self.tid.0, self.tid.1, self.precursors, self.condition, self.fallback
        )
    }
}

pub struct ConfigParser;

impl ConfigParser {
    fn load_file(&self, file: &str) -> Result<String, DagError> {
        let contents =
            fs::read_to_string(file).map_err(|e| DagError::ParserError(e.to_string()))?;
        Ok(contents)
    }

    fn parse_yaml(&self, content: &str) -> Result<YamlConfig, DagError> {
        from_str(content).map_err(|e| DagError::ParserError(e.to_string()))
    }
}

impl Parser for ConfigParser {
    fn parse_tasks(
        &self,
        file: &str,
        specific_actions: HashMap<String, Action>,
    ) -> Result<Vec<Box<dyn Task>>, DagError> {
        let content = self.load_file(file)?;
        self.parse_tasks_from_str(&content, specific_actions)
    }

    fn parse_tasks_from_str(
        &self,
        content: &str,
        _specific_actions: HashMap<String, Action>,
    ) -> Result<Vec<Box<dyn Task>>, DagError> {
        let config = self.parse_yaml(content)?;
        let mut map = HashMap::new();
        let mut tasks = Vec::new();

        for (task_id, task_info) in config.dag {
            let task = MyTask::new(
                &task_id,
                task_info.after,
                task_info.name,
                CommandAction::new("echo Executing task"),
                task_info.condition,
                task_info.fallback,
            );
            map.insert(task.str_id(), task.id());
            tasks.push(task);
        }

        for task in tasks.iter_mut() {
            let mut pres = Vec::new();
            let str_pre = task.str_precursors();
            if !str_pre.is_empty() {
                for pre in str_pre {
                    pres.push(*map.get(&pre).ok_or_else(|| {
                        DagError::ParserError(format!("Dependency {} not found", pre))
                    })?);
                }
                task.init_precursors(pres);
            }
        }

        Ok(tasks.into_iter().map(|task| Box::new(task) as Box<dyn Task>).collect())
    }
}

pub fn main() {
    let file = "tasks/sample_dag.yaml";
    let mut dag =
        Dag::with_config_file_and_parser(file, Box::new(ConfigParser), HashMap::new()).unwrap();
    assert!(dag.start().is_ok());
}
