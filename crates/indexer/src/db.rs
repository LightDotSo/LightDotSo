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

use redb::{Database, ReadableTable, TableDefinition};
use std::error::Error;

// From: https://raw.githubusercontent.com/thesimplekid/nostrrepo/bb2e3f635ff4f90b3f2648cfef34cd6900db60f8/portan/src/database.rs
// License: Apache-2.0

const TABLE: TableDefinition<&str, &str> = TableDefinition::new("redb");

pub struct ReDb {
    db: Database,
}

impl ReDb {
    pub fn new(value: &str) -> Self {
        let db = Database::create(value).unwrap_or_else(|_| Database::open(value).unwrap());
        let write_txn = db.begin_write().unwrap();
        {
            let mut _table = write_txn.open_table(TABLE).unwrap();
        }
        write_txn.commit().unwrap();

        Self { db }
    }

    pub fn write(&mut self, key: &str, value: &str) -> Result<(), Box<dyn Error>> {
        let write_txn = self.db.begin_write()?;
        {
            let mut table = write_txn.open_table(TABLE)?;
            table.insert(key, value)?;
        }
        write_txn.commit()?;
        Ok(())
    }

    pub fn read(&self, key: &str) -> Result<Option<String>, Box<dyn Error>> {
        let read_txn = self.db.begin_read()?;
        let table = read_txn.open_table(TABLE)?;
        if let Some(name) = table.get(key)? {
            return Ok(Some(name.value().to_owned()));
        }
        Ok(None)
    }
}

#[cfg(test)]
mod tests {
    // Import necessary dependencies
    use super::*;

    #[test]
    fn test_new_db() {
        ReDb::new("test.redb");
        // Assert that the database is successfully created or opened twice
        let mut db = ReDb::new("test_new.redb");
        assert!(db.db.check_integrity().is_ok());
    }

    #[test]
    fn test_write_and_read() {
        let mut db = ReDb::new("test_write.redb");
        let key = "key";
        let name = "John Doe";

        // Write data to the database
        let result = db.write(key, name);
        assert!(result.is_ok());

        // Read the written data from the database
        let read_result = db.read(key);
        assert!(read_result.is_ok());
        assert_eq!(read_result.unwrap(), Some(name.to_owned()));
    }

    #[test]
    fn test_read_nonexistent_key() {
        let db = ReDb::new("test_none.redb");
        let key = "nonexistent_key";

        // Attempt to read a nonexistent value from the database
        let read_result = db.read(key);
        assert!(read_result.is_ok());
        assert_eq!(read_result.unwrap(), None);
    }
}
