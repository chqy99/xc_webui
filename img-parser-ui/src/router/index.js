import { createRouter, createWebHistory } from 'vue-router'
import ParseView from '@/views/ParseView.vue'

const routes = [
  {
    path: '/',
    redirect: '/parse'
  },
  {
    path: '/parse',
    component: ParseView
  },
  // 后续可以加入检索页面
  // {
  //   path: '/retrieval',
  //   component: RetrievalView
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
