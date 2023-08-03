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

use redb::{Database, Error, ReadableTable, TableDefinition};

// From: https://github.com/cberner/redb/blob/e5ef57896ac023bc8d0c36e97d89fbcfce7cccf9/examples/int_keys.rs

const TABLE: TableDefinition<u64, u64> = TableDefinition::new("indexer");

pub fn insert(db: &Database, key: String, value: String) -> Result<(), Error> {
    let write_txn = db.begin_write()?;
    {
        let mut table = write_txn.open_table(TABLE)?;
        table.insert(0, 0)?;
    }
    write_txn.commit()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_insert_success() {
        let db = Database::create("int_keys.redb").unwrap();
        let key = "key".to_string();
        let value = "value".to_string();
        let result = insert(&db, key, value);
        assert!(result.is_ok());
    }
}
