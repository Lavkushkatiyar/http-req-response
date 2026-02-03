const decoder = new TextDecoder();
const encoder = new TextEncoder();

const greeting = await Deno.readTextFileSync("./pages/example.html");
const example = await Deno.readTextFileSync("./pages/example.html");

const createHeaders = (headers) => {
  return Object.entries(headers)
    .map(([name, value]) => `${name}: ${value}`)
    .join("\r\n");
};
const createResponseLine = (protocol, statusCode) =>
  `${protocol} ${statusCode} OK`;

const createSuccessResponse = (content) => {
  const headers = {};
  headers["Content-Type"] = "text/html";
  headers["Content-Length"] = content.length;
  const header = createHeaders(headers);
  const responseLine = createResponseLine("HTTP/1.1", 200);

  return [responseLine, header, "", content].join("\r\n");
};

const handleConnection = async (connection) => {
  const buffer = new Uint8Array(1024);
  const bytesRead = await connection.read(buffer);
  if (bytesRead === null) {
    connection.close();
    return;
  }
  const request = decoder.decode(buffer.slice(0, bytesRead));
  const [requestLine] = request.split("\r\n");
  const [method, path, protocol] = requestLine.split(" ");
  console.log(`Method = ${method}, path = ${path}, protocol = ${protocol}`);

  switch (path) {
    case "/":
      await connection.write(encoder.encode(createSuccessResponse(greeting)));
      break;
    case "/greeting.html":
      await connection.write(encoder.encode(createSuccessResponse(greeting)));
      break;
    case "/example.html":
      await connection.write(encoder.encode(createSuccessResponse(example)));
      break;

    default:
      break;
  }
};

const main = async (port) => {
  const listener = Deno.listen({ port });
  console.log("Server running on http://localhost:8000");
  for await (const connection of listener) {
    handleConnection(connection);
  }
};
main(8000);
