export const deleteCookies = (cookies: any, res: any) => {
  try {
    let cookiesArr = []
    for (const cookie in cookies) {
      cookiesArr.push(`${cookie}=;Path=/;MAX-AGE=0`)
    }
    res.setHeader('set-cookie', cookiesArr)
  } catch (error) {
    console.log('error occured ', error)
  }
  return res
}
