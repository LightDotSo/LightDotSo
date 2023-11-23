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

// Code from gist:https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940?permalink_comment_id=4742498#gistcomment-4742498
// License: Unknown

export function debounce<T extends (...args: any[]) => any>(
  cb: T,
  wait: number,
) {
  let h: any;
  const callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return <T>(<any>callable);
}
