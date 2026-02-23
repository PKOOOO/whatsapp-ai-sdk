"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Save, RotateCcw, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Settings {
    id: string
    botName: string
    systemPrompt: string
    welcomeMessage: string
    maxTokens: number
    isActive: boolean
}

const defaults: Omit<Settings, "id"> = {
    botName: "AI Assistant",
    systemPrompt: "You are a helpful AI assistant.",
    welcomeMessage: "Hello! How can I help you today?",
    maxTokens: 1024,
    isActive: true,
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch("/api/dashboard/settings")
            .then((r) => r.json())
            .then((data) => setSettings(data))
            .catch(() => toast.error("Failed to load settings"))
            .finally(() => setLoading(false))
    }, [])

    const handleSave = async () => {
        if (!settings) return
        setSaving(true)
        try {
            const res = await fetch("/api/dashboard/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })
            if (res.ok) {
                toast.success("Settings saved successfully!")
            } else {
                toast.error("Failed to save settings")
            }
        } catch {
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        if (!settings) return
        setSettings({ ...settings, ...defaults })
        toast.info("Reset to defaults. Click Save to apply.")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        )
    }

    if (!settings) return null

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100 text-base">
                        Bot Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Bot Name */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Bot Name</Label>
                        <Input
                            value={settings.botName}
                            onChange={(e) =>
                                setSettings({ ...settings, botName: e.target.value })
                            }
                            className="bg-zinc-800/50 border-zinc-700 text-zinc-100 focus-visible:ring-emerald-500/50"
                        />
                    </div>

                    {/* System Prompt */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-300">System Prompt</Label>
                            <span className="text-xs text-zinc-500">
                                {settings.systemPrompt.length} characters
                            </span>
                        </div>
                        <Textarea
                            value={settings.systemPrompt}
                            onChange={(e) =>
                                setSettings({ ...settings, systemPrompt: e.target.value })
                            }
                            rows={6}
                            className="bg-zinc-800/50 border-zinc-700 text-zinc-100 resize-none focus-visible:ring-emerald-500/50"
                        />
                    </div>

                    {/* Welcome Message */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Welcome Message</Label>
                        <Textarea
                            value={settings.welcomeMessage}
                            onChange={(e) =>
                                setSettings({ ...settings, welcomeMessage: e.target.value })
                            }
                            rows={3}
                            className="bg-zinc-800/50 border-zinc-700 text-zinc-100 resize-none focus-visible:ring-emerald-500/50"
                        />
                    </div>

                    {/* Max Tokens */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-300">Max Tokens</Label>
                            <span className="text-sm font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                {settings.maxTokens}
                            </span>
                        </div>
                        <Slider
                            value={[settings.maxTokens]}
                            onValueChange={([value]) =>
                                setSettings({ ...settings, maxTokens: value })
                            }
                            min={256}
                            max={4096}
                            step={128}
                            className="[&_[role=slider]]:bg-emerald-500"
                        />
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span>256</span>
                            <span>4096</span>
                        </div>
                    </div>

                    {/* Bot Active */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                        <div>
                            <Label className="text-zinc-300">Bot Active</Label>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Turn off to stop the bot from responding to messages
                            </p>
                        </div>
                        <Switch
                            checked={settings.isActive}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, isActive: checked })
                            }
                            className="data-[state=checked]:bg-emerald-600"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset to Defaults
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
