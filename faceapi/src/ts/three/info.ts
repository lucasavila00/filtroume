export interface IInfo {
  lut: {
    url: string;
    size: number;
  };
  images: {
    center: string;
  };
  pathname?: string;
}

function parseURL(url: string) {
  var parser = document.createElement("a"),
    searchObject: any = {},
    queries: any,
    split: any,
    i: any;
  // Let the browser do the work
  parser.href = url;
  // Convert query string to object
  queries = parser.search.replace(/^\?/, "").split("&");
  for (i = 0; i < queries.length; i++) {
    split = queries[i].split("=");
    searchObject[split[0]] = split[1];
  }
  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    searchObject: searchObject,
    hash: parser.hash,
  };
}

export const getInfo = async (): Promise<IInfo | null> => {
  if (
    window.parent &&
    (window.parent as any)._lut &&
    (window.parent as any)._img
  ) {
    return {
      lut: {
        url: (window.parent as any)._lut,
        size: 16,
      },
      images: {
        center: (window.parent as any)._img,
      },
    };
  }

  const parsed = parseURL(window.location.href);
  const pathname = parsed.pathname.split("/").join("");
  const url =
    "https://us-central1-filterme.cloudfunctions.net/filterUrls?id=" +
    pathname;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data) {
      return null;
    } else if (data.error) {
      console.error({ data });
      return null;
    } else {
      return {
        lut: {
          url: data.url,
          size: 16,
        },
        images: {
          center: data.image,
        },
        pathname,
      };
    }
  } catch (err) {
    console.error(err);
  } finally {
    return null;
  }
};
