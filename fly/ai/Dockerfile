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

FROM python:3.11-slim-buster

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=8000"]
# CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "src.lightdotso.server:app", "-b", "0.0.0.0:8000"]
# CMD ["uvicorn", "src.lightdotso.server:app", "--host", "0.0.0.0"]
ENTRYPOINT ["flask"]

RUN ["run", "--host", "0.0.0.0"]
