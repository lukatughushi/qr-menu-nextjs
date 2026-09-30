import { Router } from 'express'
import { supabaseAdmin } from '../supabaseAdmin.js'
import { requireUser, requirePermission } from '../rbac.js'

export const bannersRouter = Router()

bannersRouter.use(requireUser, requirePermission('can_manage_banners'))

bannersRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid banner id' }); return }

  const { data, error } = await supabaseAdmin
    .from('hero_banners')
    .delete()
    .eq('id', id)
    .select()

  if (error) { res.status(400).json({ error: error.message }); return }
  if (!data || data.length === 0) {
    res.status(404).json({ error: 'Banner not found.' })
    return
  }
  res.json({ success: true })
})

bannersRouter.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid banner id' }); return }
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  const { data, error } = await supabaseAdmin
    .from('hero_banners')
    .update(req.body)
    .eq('id', id)
    .select()

  if (error) { res.status(400).json({ error: error.message }); return }
  if (!data || data.length === 0) {
    res.status(404).json({ error: 'Banner not found.' })
    return
  }
  res.json({ success: true, data: data[0] })
})
