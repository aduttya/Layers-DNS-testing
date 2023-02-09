// /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env : {
    MONGO_URI : "mongodb+srv://Aduttya:A1gWTjEwDJC4DYo9@cluster0.esdgm.mongodb.net/?retryWrites=true&w=majority"
  }

}

module.exports = nextConfig
