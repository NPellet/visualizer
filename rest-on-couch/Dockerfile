FROM ghcr.io/cheminfo/rest-on-couch:19

RUN apt-get update && \
    apt-get install -y jq

COPY /wait.sh /start.sh /create_db.sh /
RUN chmod +x /wait.sh /start.sh /create_db.sh

# Copy config files

# By default /rest-on-couch is the home directory the rest-on-couch image expects.
# Can be overridden by overriding the REST_ON_COUCH_HOME_DIR environment variable.
COPY home /rest-on-couch/

RUN cd /rest-on-couch

WORKDIR /app

CMD ["/start.sh"]
