FROM haproxy:3.1-alpine

WORKDIR /usr/local/etc/haproxy

COPY haproxy.cfg ./haproxy.cfg

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD nc -z localhost 8080 || exit 1

CMD ["haproxy", "-f", "/usr/local/etc/haproxy/haproxy.cfg", "-db"]