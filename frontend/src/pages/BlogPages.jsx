import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";

export function BlogPage() {
    const { i18n } = useTranslation();
    const [posts, setPosts] = useState([]);
    useEffect(() => { api.get("/blog").then(r => setPosts(r.data)); }, []);
    return (
        <div data-testid="blog-page" className="py-16">
            <div className="container-x">
                <div className="eyebrow">Journal</div>
                <h1 className="mt-2 font-display text-5xl sm:text-6xl">Stories from the road</h1>
                <div className="mt-16 grid md:grid-cols-3 gap-10">
                    {posts.map((b) => {
                        const tr = b.translations?.[i18n.language] || b.translations?.en || {};
                        return (
                            <Link key={b.slug} to={`/blog/${b.slug}`} data-testid={`blog-card-${b.slug}`} className="group">
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src={b.image} alt={tr.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                </div>
                                <div className="mt-5">
                                    <div className="eyebrow">Journal</div>
                                    <div className="mt-2 font-display text-2xl leading-tight">{tr.title}</div>
                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{tr.excerpt}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function BlogDetailPage() {
    const { slug } = useParams();
    const { i18n } = useTranslation();
    const [b, setB] = useState(null);
    useEffect(() => { api.get(`/blog/${slug}`).then(r => setB(r.data)); }, [slug]);
    if (!b) return <div className="container-x py-24">Loading...</div>;
    const tr = b.translations?.[i18n.language] || b.translations?.en || {};
    return (
        <article className="py-8">
            <div className="relative h-[50vh] overflow-hidden">
                <img src={b.image} alt={tr.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                <div className="absolute bottom-8 left-0 right-0 container-x text-white">
                    <div className="eyebrow text-gold">Journal</div>
                    <h1 className="mt-2 font-display text-5xl max-w-3xl">{tr.title}</h1>
                </div>
            </div>
            <div className="container-x py-16 max-w-3xl">
                <p className="text-lg italic text-muted-foreground">{tr.excerpt}</p>
                <div className="mt-8 leading-loose whitespace-pre-wrap">{tr.body}</div>
                <Link to="/blog" className="mt-12 inline-block text-sm text-gold">← Back to Journal</Link>
            </div>
        </article>
    );
}
