import HttpStatus from "http-status-codes"
import jwt from "jsonwebtoken"
import { findUserOAuthId } from "../Mysql/Users/users.service"
import { webAuth } from "../utils/auth0"
import { roles } from "../utils/constants"
import { errorHandler } from "../utils/errorHandler"
import { getUserRoleType } from "../Mysql/UserRoles/userRoles.service"
/**
 * Middleware to authenticate if user has a valid Authorization token
 * Authorization: Bearer <token>
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const userAuth = async (req, res, next) => {
  try {
    let bearerToken = req.header("Authorization")
    if (bearerToken) {
      bearerToken = bearerToken.split("Bearer")[1].trim()
      const userInfo = jwt.verify(
        bearerToken,
        process.env.AUTH0_CLIENT_SECRET,
        { algorithm: "RS256" },
        (err, decoded) => {
          if (err) {
            throw Error(err)
          }
          return decoded
        }
      )
      const user = await findUserOAuthId(userInfo.sub)

      if (user?.is_active === 0) {
        return res.status(HttpStatus.UNAUTHORIZED).send({
          code: HttpStatus.UNAUTHORIZED,
          message: "User is Inactive",
        })
      }
      userInfo.role = await getUserRoleType(user?.id, user?.company?.type)
      if ((userInfo?.role === roles.Partner && userInfo?.from === roles.Partner) || (userInfo?.role === roles.SuperAdmin && userInfo?.from === roles.SuperAdmin)) {
        userInfo.full_name = userInfo.name
        userInfo.auth0_id = user.auth0_id
        if (!userInfo?.company_id) {
          userInfo.company_id = user.company_id
        }
        if (!userInfo?.id) {
          userInfo.id = user.id
        }
        req.user = userInfo;
      } else {
        /* eslint-disable no-lonely-if */
        if(!user?.role) {
          req.user = { sub: userInfo.sub, role:userInfo?.role, ...user }
        } else {
          req.user = { sub: userInfo.sub, ...user }
        } 
      }
      next()
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        code: HttpStatus.UNAUTHORIZED,
        message: "Authorization token is required",
      })
    }
  } catch (error) {
    errorHandler(error)
    return res.status(HttpStatus.UNAUTHORIZED).send({
      code: HttpStatus.UNAUTHORIZED,
      message: error,
    })
  }
}

export const getIdTokenFromAccessToken = async (req, res, next) => {
  try {
    let bearerToken = req.body.Authorization
    const { expireTime } = req.body
    const { from } = req.body
    if (bearerToken) {
      bearerToken = bearerToken.split("Bearer")[1].trim()
      let userInfo
      if (from === roles.Partner || from === roles.SuperAdmin) {
        const decodedToken = jwt.verify(
          bearerToken,
          process.env.AUTH0_CLIENT_SECRET,
          { algorithm: "RS256" },
          (err, decoded) => {
            if (err) {
              throw Error(err)
            }
            return decoded
          }
        )
        delete decodedToken?.iat
        delete decodedToken?.exp
        userInfo = decodedToken
      } else {
        await webAuth.users.getInfo(bearerToken).then((data) => {
          userInfo = data
        })
      }
      const expiresIn = parseInt(expireTime, 10) || 120 * 60
      const token = jwt.sign(
        userInfo,
        process.env.AUTH0_CLIENT_SECRET,
        { expiresIn },
        { algorithm: "RS256" }
      )
      req.user = userInfo
      req.token = token

      next()
    } else if (process.env.ENVIRONMENT !== "DEV") {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        code: HttpStatus.UNAUTHORIZED,
        message: "Authorization token is required",
      })
    }
  } catch (error) {
    errorHandler(error)
    return res.status(HttpStatus.UNAUTHORIZED).send({
      code: HttpStatus.UNAUTHORIZED,
      message: error,
    })
  }
}
