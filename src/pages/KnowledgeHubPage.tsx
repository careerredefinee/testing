import { useEffect, useState } from 'react';
import { articleService, Article } from '../services/articleService';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

const KnowledgeHubPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await articleService.getArticles({ limit: 50 });
        if (mounted) setArticles(data);
      } catch (e) {
        console.error('Failed to load articles', e);
        if (mounted) setError('Failed to load articles');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 min-h-[60vh]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">All Articles</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Explore insights, guides, and thought leadership from Career Redefine.</p>
        </div>

        {loading && (
          <div className="text-center text-gray-500">Loading articles...</div>
        )}
        {error && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((insight, index) => (
              <article
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
              >
                {/* Image with bottom title only */}
                <div className="relative h-56">
                  <img
                    src={insight.image || 'https://via.placeholder.com/800x450?text=Article'}
                    alt={insight.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="inline-block text-2xl font-extrabold leading-tight line-clamp-2 bg-black/60 px-3 py-1 rounded-md shadow-md">{insight.title}</h3>
                  </div>
                </div>

                {/* Lower content */}
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-700 mb-4">
                    <div className="flex items-center gap-3">
                      <img src="/cr_logo.png" alt="CareerRedefine" className="w-6 h-6 rounded-full border border-gray-200" />
                      <div className="leading-tight">
                        <div className="font-semibold">CareerRedefine</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>~5-10 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{insight.publishedAt ? new Date(insight.publishedAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-5 line-clamp-3">{insight.summary}</p>

                  <div className="flex justify-end">
                    <a
                      href={(insight as any).link || (insight as any).readMoreLnk || '#'}
                      target={(((insight as any).link || (insight as any).readMoreLnk) ? '_blank' : undefined) as any}
                      rel={(((insight as any).link || (insight as any).readMoreLnk) ? 'noopener noreferrer' : undefined) as any}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Continue Reading
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default KnowledgeHubPage;
