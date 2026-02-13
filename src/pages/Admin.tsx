import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, LogOut, Package, Tag, LayoutDashboard, Upload, X, Settings, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive("Preço deve ser positivo"),
  original_price: z.number().positive().optional().nullable(),
  condition: z.string(),
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  brand: z.string().max(100).optional(),
  category_id: z.string().optional().nullable(),
  featured: z.boolean(),
});

type Tab = "dashboard" | "products" | "categories" | "settings";

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [form, setForm] = useState({
    title: "", description: "", price: "", original_price: "", condition: "bom",
    size: "", color: "", brand: "", category_id: "", featured: false,
    images: [] as string[],
  });
  const [newCategory, setNewCategory] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [pixSettings, setPixSettings] = useState({ pix_key: "", pix_name: "", pix_city: "" });

  useEffect(() => {
    const checkAdminAccess = async (session: Session | null) => {
      if (!session) {
        navigate("/auth");
        return;
      }

      // Verifica se o email é o do administrador
      const isAdminEmail = session.user?.email === 'ogustavo.ctt@gmail.com';
      
      if (isAdminEmail) {
        // Garante que o usuário tem a role de admin
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!existingRole) {
          // Se não tiver a role de admin, cria
          await supabase
            .from("user_roles")
            .insert([{ user_id: session.user.id, role: 'admin' }]);
        }
        
        setIsAdmin(true);
      } else {
        // Se não for o email do admin, redireciona para a página inicial
        toast.error("Acesso restrito");
        navigate("/");
      }
      
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await checkAdminAccess(session);
    });

    // Verifica a sessão atual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      await checkAdminAccess(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Realtime subscription para categorias - atualiza em tempo real
  useEffect(() => {
    if (!isAdmin) return;
    
    const channel = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          console.log('Categoria alterada:', payload);
          // Invalida TODAS as queries de categorias
          queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0]?.toString().includes('category') });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, queryClient]);

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
      return map;
    },
    enabled: isAdmin,
  });

  useEffect(() => {
    if (settings) setPixSettings({
      pix_key: settings.pix_key || "",
      pix_name: settings.pix_name || "Garimpário",
      pix_city: settings.pix_city || "SAO PAULO",
    });
  }, [settings]);

  const savePixSettings = useMutation({
    mutationFn: async () => {
      const updates = [
        { key: "pix_key", value: pixSettings.pix_key },
        { key: "pix_name", value: pixSettings.pix_name },
        { key: "pix_city", value: pixSettings.pix_city },
      ];
      for (const u of updates) {
        const { error } = await supabase.from("settings").upsert(u, { onConflict: "key" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Configurações PIX salvas!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const saveProduct = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      
      const parsed = productSchema.parse({
        title: form.title,
        description: form.description || undefined,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        condition: form.condition,
        size: form.size || undefined,
        color: form.color || undefined,
        brand: form.brand || undefined,
        category_id: form.category_id || null,
        featured: form.featured,
      });

      const payload = {
        title: parsed.title,
        price: parsed.price,
        condition: parsed.condition,
        featured: parsed.featured,
        description: parsed.description || null,
        original_price: parsed.original_price || null,
        size: parsed.size || null,
        color: parsed.color || null,
        brand: parsed.brand || null,
        category_id: parsed.category_id || null,
        user_id: user.id,
        status: "available" as const,
        images: form.images.length > 0 ? form.images : null,
      };

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }
    },
    onMutate: () => setIsSubmitting(true),
    onSettled: () => setIsSubmitting(false),
    onSuccess: () => {
      toast.success(editingProduct ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setShowProductForm(false);
    },
    onError: (err: any) => {
      console.error("Erro ao salvar produto:", err);
      toast.error(err.message || "Erro ao salvar produto. Tente novamente.");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produto removido!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => toast.error("Erro ao remover"),
  });

  const addCategory = useMutation({
    mutationFn: async () => {
      if (!newCategory.trim()) return;
      const slug = newCategory.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error } = await supabase.from("categories").insert({ name: newCategory.trim(), slug });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Categoria criada!");
      setNewCategory("");
      // Invalida TODAS as queries de categorias (admin e site)
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0]?.toString().includes('category') });
    },
    onError: () => toast.error("Erro ao criar categoria"),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Categoria removida!");
      // Invalida TODAS as queries de categorias (admin e site)
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0]?.toString().includes('category') });
    },
    onError: () => toast.error("Erro ao remover categoria"),
  });

  const resetForm = () => {
    setForm({ title: "", description: "", price: "", original_price: "", condition: "bom", size: "", color: "", brand: "", category_id: "", featured: false, images: [] });
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} muito grande. Máximo 5MB.`);
          continue;
        }
        
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        
        console.log(`Enviando imagem: ${path}`);
        
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { 
            upsert: false,
            contentType: file.type
          });
          
        if (uploadError) {
          console.error("Erro no upload:", uploadError);
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
          
        uploadedUrls.push(publicUrl);
        console.log(`Imagem enviada com sucesso: ${publicUrl}`);
      }
      
      if (uploadedUrls.length > 0) {
        setForm((f) => ({ ...f, images: [...f.images, ...uploadedUrls] }));
        toast.success(`${uploadedUrls.length} imagem(ns) enviada(s) com sucesso!`);
      }
    } catch (e: any) {
      console.error("Erro completo no upload:", e);
      toast.error(e.message || "Erro ao enviar imagens. Verifique se o bucket 'product-images' existe no Supabase.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((img) => img !== url) }));
  };

  const startEdit = (product: any) => {
    setForm({
      title: product.title,
      description: product.description || "",
      price: String(product.price),
      original_price: product.original_price ? String(product.original_price) : "",
      condition: product.condition,
      size: product.size || "",
      color: product.color || "",
      brand: product.brand || "",
      category_id: product.category_id || "",
      featured: product.featured || false,
      images: product.images || [],
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-xl text-muted-foreground">Carregando...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Acesso restrito</h1>
          <p className="font-body text-muted-foreground mb-6">Você não tem permissão de administrador.</p>
          <button onClick={handleLogout} className="font-body text-sm text-primary uppercase tracking-wider hover:underline">Sair</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard" as Tab, label: "Painel", icon: LayoutDashboard },
    { id: "products" as Tab, label: "Produtos", icon: Package },
    { id: "categories" as Tab, label: "Categorias", icon: Tag },
    { id: "settings" as Tab, label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl font-bold">Garimpário</h1>
            <span className="font-body text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={14} /> Voltar ao site
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs - horizontal scroll em mobile */}
        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 font-body text-xs uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-border p-6">
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Total de produtos</p>
              <p className="font-display text-3xl font-bold">{products?.length || 0}</p>
            </div>
            <div className="border border-border p-6">
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Categorias</p>
              <p className="font-display text-3xl font-bold">{categories?.length || 0}</p>
            </div>
            <div className="border border-border p-6">
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Em destaque</p>
              <p className="font-display text-3xl font-bold">{products?.filter((p: any) => p.featured).length || 0}</p>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold">Produtos</h2>
              <button
                onClick={() => { resetForm(); setShowProductForm(true); }}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary text-primary-foreground px-4 py-3 sm:py-2 font-body text-xs uppercase tracking-widest hover:bg-terracotta-dark transition-colors"
              >
                <Plus size={14} /> <span className="sm:hidden">Novo</span><span className="hidden sm:inline">Novo produto</span>
              </button>
            </div>

            {showProductForm && (
              <div className="border border-border p-4 sm:p-6 mb-8 space-y-4">
                <h3 className="font-display text-base sm:text-lg font-bold">{editingProduct ? "Editar" : "Novo"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Título *</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Marca</label>
                    <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Preço *</label>
                    <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Preço original</label>
                    <input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Condição</label>
                    <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary">
                      <option value="novo">Novo</option>
                      <option value="excelente">Excelente</option>
                      <option value="bom">Bom</option>
                      <option value="usado">Usado</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Categoria</label>
                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary">
                      <option value="">Sem categoria</option>
                      {categories?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Tamanho</label>
                    <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Cor</label>
                    <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Imagens</label>
                  <div className="flex flex-wrap gap-3 mb-2">
                    {form.images.map((url) => (
                      <div key={url} className="relative w-20 h-20 border border-border">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(url)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="inline-flex items-center gap-2 border border-dashed border-border px-4 py-3 cursor-pointer hover:border-primary transition-colors">
                    <Upload size={16} />
                    <span className="font-body text-xs uppercase tracking-wider">
                      {uploadingImages ? "Enviando..." : "Enviar imagens"}
                    </span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadImages(e.target.files)} disabled={uploadingImages} />
                  </label>
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Descrição</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary resize-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-primary" />
                  <span className="font-body text-sm">Destaque na home</span>
                </label>
                <div className="flex gap-3">
                  <button onClick={() => saveProduct.mutate()} disabled={saveProduct.isPending} className="bg-primary text-primary-foreground px-6 py-2 font-body text-xs uppercase tracking-widest hover:bg-terracotta-dark transition-colors disabled:opacity-50">
                    {saveProduct.isPending ? "Salvando..." : "Salvar"}
                  </button>
                  <button onClick={resetForm} className="border border-border px-6 py-2 font-body text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancelar</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {products?.map((product: any) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border border-border hover:bg-card transition-colors">
                  <div className="w-12 h-12 bg-muted flex-shrink-0">
                    <img src={product.images?.[0] || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body text-sm font-medium truncate">{product.title}</h3>
                    <p className="font-body text-xs text-muted-foreground">{product.categories?.name} · R$ {Number(product.price).toFixed(2).replace(".", ",")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.featured && <span className="font-body text-[10px] uppercase tracking-wider bg-accent text-accent-foreground px-2 py-0.5">Destaque</span>}
                    <button onClick={() => startEdit(product)} className="p-2 text-muted-foreground hover:text-foreground"><Edit2 size={14} /></button>
                    <button onClick={() => deleteProduct.mutate(product.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {(!products || products.length === 0) && (
                <p className="text-center py-12 font-body text-sm text-muted-foreground">Nenhum produto cadastrado ainda</p>
              )}
            </div>
          </div>
        )}

        {/* Settings - PIX */}
        {activeTab === "settings" && (
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Configurações PIX</h2>
            <div className="max-w-md space-y-4 border border-border p-6">
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Chave PIX (e-mail, CPF, telefone ou chave aleatória)</label>
                <input value={pixSettings.pix_key} onChange={(e) => setPixSettings((s) => ({ ...s, pix_key: e.target.value }))} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary" placeholder="seu@email.com ou 123.456.789-00" />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Nome do recebedor</label>
                <input value={pixSettings.pix_name} onChange={(e) => setPixSettings((s) => ({ ...s, pix_name: e.target.value }))} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Cidade</label>
                <input value={pixSettings.pix_city} onChange={(e) => setPixSettings((s) => ({ ...s, pix_city: e.target.value }))} className="w-full px-3 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary" placeholder="SAO PAULO" />
              </div>
              <button onClick={() => savePixSettings.mutate()} disabled={savePixSettings.isPending} className="bg-primary text-primary-foreground px-6 py-2 font-body text-xs uppercase tracking-widest hover:bg-terracotta-dark transition-colors disabled:opacity-50">
                {savePixSettings.isPending ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </div>
        )}

        {/* Categories */}
        {activeTab === "categories" && (
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Categorias</h2>
            <div className="flex gap-3 mb-6">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nome da categoria"
                className="flex-1 px-4 py-2 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => addCategory.mutate()}
                disabled={addCategory.isPending}
                className="bg-primary text-primary-foreground px-4 py-2 font-body text-xs uppercase tracking-widest hover:bg-terracotta-dark transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {categories?.map((cat: any) => (
                <div key={cat.id} className="flex items-center justify-between p-4 border border-border">
                  <div>
                    <span className="font-body text-sm font-medium">{cat.name}</span>
                    <span className="font-body text-xs text-muted-foreground ml-3">/{cat.slug}</span>
                  </div>
                  <button onClick={() => deleteCategory.mutate(cat.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              ))}
              {(!categories || categories.length === 0) && (
                <p className="text-center py-12 font-body text-sm text-muted-foreground">Nenhuma categoria criada</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
