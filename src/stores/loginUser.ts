/*
 * @Author: jean cw252128385@gmail.com
 * @Date: 2026-03-21 13:13:04
 * @LastEditors: jean cw252128385@gmail.com
 * @LastEditTime: 2026-04-05 22:18:46
 * @FilePath: \ai-code-mother-scratch-frontend\src\stores\loginUser.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUser } from '@/api/userController.ts'

/**
 * 登录用户信息
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  // 默认值
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  // 获取登录用户信息
  async function fetchLoginUser() {
    const res = await getLoginUser()
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data
    }
  }

  // 更新登录用户信息
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  return { loginUser, fetchLoginUser, setLoginUser }
})
