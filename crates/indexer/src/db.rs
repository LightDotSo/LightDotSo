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

use sled::IVec;
// From: https://github.com/spacejam/sled/blob/6452ca17e423808dcce98466e595d5195f3e5fea/examples/structured.rs

pub fn insert(db: &sled::Db, key: String, value: IVec) -> Result<(), sled::Error> {
    db.insert(key, value)?;
    Ok(())
}

pub fn get(db: &sled::Db, key: String) -> Result<Option<IVec>, sled::Error> {
    let res = db.get(key)?;
    Ok(res)
}

#[cfg(test)]
mod tests {
    use super::*;
    use sled::Config;

    #[test]
    fn test_insert_success() {
        // setup a temporary database
        let config = Config::new().temporary(true);
        let db = config.open().unwrap();

        // test data
        let key = "key".to_string();
        let value = IVec::from("value".as_bytes());

        // attempt to insert
        let res = insert(&db, key.clone(), value.clone());
        assert!(res.is_ok(), "Insert should succeed");

        // verify that the insert worked correctly
        let verify = db.get(&key).unwrap();
        assert_eq!(verify, Some(value));
    }
}
