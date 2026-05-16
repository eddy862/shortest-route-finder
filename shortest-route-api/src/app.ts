import express from 'express'
import routeRoutes from "./routes/route.routes"
import locationRoutes from "./routes/locations.routes"
import deliveryRoutes from "./routes/deliveries.routes"
import { errorHandler } from './middleware/errorHandler'
import morgan from 'morgan'

const app = express()

app.use(morgan('dev'))
app.use(express.json())

app.use("/route", routeRoutes)
app.use("/locations", locationRoutes)
app.use("/deliveries", deliveryRoutes)

app.use(errorHandler)

export default app